import { randomUUID } from 'node:crypto';
import { In } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { OrderStatus, PaymentStatus } from '../../constants/status.enum.js';
import { UserRole } from '../../constants/roles.enum.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { ForbiddenError } from '../../core/errors/forbidden.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { getPagination } from '../../core/utils/pagination.util.js';
import { Cart } from '../cart/cart.entity.js';
import { CartItem } from '../cart/cart-item.entity.js';
import { Product } from '../product/product.entity.js';
import { NotificationService } from '../notification/notification.service.js';
import { Order } from './order.entity.js';
import { OrderItem } from './order-item.entity.js';

export class OrderService {
  private get orderRepo() { return AppDataSource.getRepository(Order); }
  private get orderItemRepo() { return AppDataSource.getRepository(OrderItem); }
  private get notificationService() { return new NotificationService(); }

  async checkout(buyerId: string) {
    const order = await AppDataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(Cart);
      const cartItemRepo = manager.getRepository(CartItem);
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const cart = await cartRepo.findOne({
        where: { buyerId },
        relations: { items: { product: true } },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestError('Cart is empty');
      }

      let totalAmount = 0;
      for (const item of cart.items) {
        if (!item.product.status) {
          throw new BadRequestError(`${item.product.name} is no longer available`);
        }
        if (item.product.stock < item.quantity) {
          throw new BadRequestError(`Not enough stock for ${item.product.name}`);
        }
        totalAmount += Number(item.product.price) * item.quantity;
      }

      const newOrder = await orderRepo.save(orderRepo.create({
        id: randomUUID(),
        buyerId,
        totalAmount,
        paymentStatus: PaymentStatus.Pending,
        orderStatus: OrderStatus.Pending,
      }));

      const orderItems = cart.items.map((item) => orderItemRepo.create({
        id: randomUUID(),
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      }));

      await orderItemRepo.save(orderItems);

      for (const item of cart.items) {
        item.product.stock -= item.quantity;
        await productRepo.save(item.product);
      }

      await cartItemRepo.delete({ cartId: cart.id });

      return newOrder;
    });

    await this.notificationService.create({
      userId: buyerId,
      type: 'order_confirmation',
      title: 'Order placed',
      message: `Your order ${order.id} has been placed.`,
    });

    return this.getById(order.id, { id: buyerId, role: UserRole.Buyer });
  }

  async listForBuyer(buyerId: string, query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.orderRepo.findAndCount({
      where: { buyerId },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, meta: { page, limit, total } };
  }

  async listAll(query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.orderRepo.findAndCount({
      relations: { buyer: true, items: { product: true } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, meta: { page, limit, total } };
  }

  async listForSeller(sellerId: string, query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.buyer', 'buyer')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .where('product.sellerId = :sellerId', { sellerId })
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, meta: { page, limit, total } };
  }

  async getById(id: string, actor: { id: string; role: UserRole }) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { buyer: true, items: { product: true } },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (actor.role === UserRole.Buyer && order.buyerId !== actor.id) {
      throw new ForbiddenError('You can only view your own orders');
    }

    if (actor.role === UserRole.BusinessOwner) {
      const sellerProductIds = order.items
        .filter((item) => item.product.sellerId === actor.id)
        .map((item) => item.productId);
      if (sellerProductIds.length === 0) {
        throw new ForbiddenError('You can only view orders for your products');
      }
      order.items = order.items.filter((item) => sellerProductIds.includes(item.productId));
    }

    return order;
  }

  async updateStatus(
    id: string,
    data: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus },
    actor: { id: string; role: UserRole },
  ) {
    const order = await this.getById(id, actor);

    if (actor.role === UserRole.BusinessOwner) {
      if (data.paymentStatus !== undefined) {
        throw new ForbiddenError('Sellers cannot update payment status');
      }
    }

    if (data.orderStatus !== undefined) {
      order.orderStatus = data.orderStatus;
    }
    if (data.paymentStatus !== undefined) {
      order.paymentStatus = data.paymentStatus;
    }

    return this.orderRepo.save(order);
  }

  async sellerOwnsOrder(orderId: string, sellerId: string) {
    const count = await this.orderItemRepo.count({
      where: {
        orderId,
        product: {
          sellerId,
        },
      },
    });

    return count > 0;
  }

  isValidOrderStatus(status: unknown): status is OrderStatus {
    return typeof status === 'string' && Object.values(OrderStatus).includes(status as OrderStatus);
  }

  isValidPaymentStatus(status: unknown): status is PaymentStatus {
    return typeof status === 'string' && Object.values(PaymentStatus).includes(status as PaymentStatus);
  }

  async ordersContainingProducts(productIds: string[]) {
    if (productIds.length === 0) {
      return [];
    }

    return this.orderItemRepo.find({
      where: { productId: In(productIds) },
      relations: { order: true },
    });
  }
}
