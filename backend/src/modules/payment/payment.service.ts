import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { PaymentStatus } from '../../constants/status.enum.js';
import { UserRole } from '../../constants/roles.enum.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { ForbiddenError } from '../../core/errors/forbidden.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { getPagination } from '../../core/utils/pagination.util.js';
import { Order } from '../order/order.entity.js';
import { OrderService } from '../order/order.service.js';
import { Payment } from './payment.entity.js';
import { PayPalService } from './paypal.service.js';

export class PaymentService {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private orderRepo = AppDataSource.getRepository(Order);
  private orderService = new OrderService();
  private paypalService = new PayPalService();

  async payWithPayPal(buyerId: string, orderId: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.buyerId !== buyerId) {
      throw new ForbiddenError('You can only pay for your own orders');
    }
    if (order.paymentStatus === PaymentStatus.Paid) {
      throw new BadRequestError('Order is already paid');
    }

    const paypalOrder = await this.paypalService.createOrder(Number(order.totalAmount));
    const status = paypalOrder.status === 'COMPLETED' ? PaymentStatus.Paid : PaymentStatus.Pending;

    const payment = await this.paymentRepo.save(this.paymentRepo.create({
      id: randomUUID(),
      orderId: order.id,
      buyerId,
      amount: Number(order.totalAmount),
      paymentMethod: 'PayPal',
      paymentStatus: status,
      transactionId: paypalOrder.id,
    }));

    order.paymentStatus = status;
    await this.orderRepo.save(order);

    return {
      payment,
      paypal: paypalOrder,
    };
  }

  async listForBuyer(buyerId: string, query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.paymentRepo.findAndCount({
      where: { buyerId },
      relations: { order: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, meta: { page, limit, total } };
  }

  async listAll(query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.paymentRepo.findAndCount({
      relations: { buyer: true, order: true },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { items, meta: { page, limit, total } };
  }

  async listForSeller(sellerId: string, query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .where('product.sellerId = :sellerId', { sellerId })
      .orderBy('payment.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, meta: { page, limit, total } };
  }

  async getById(id: string, actor: { id: string; role: UserRole }) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: { order: { items: { product: true } }, buyer: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (actor.role === UserRole.Buyer && payment.buyerId !== actor.id) {
      throw new ForbiddenError('You can only view your own payments');
    }

    if (actor.role === UserRole.BusinessOwner) {
      const ownsOrder = await this.orderService.sellerOwnsOrder(payment.orderId, actor.id);
      if (!ownsOrder) {
        throw new ForbiddenError('You can only view payments for your orders');
      }
    }

    return payment;
  }
}
