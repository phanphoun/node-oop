import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { Order, OrderItem } from './order.entity.js';
import { Product } from '../product/product.entity.js';

export class OrderService {
  private orderRepo = AppDataSource.getRepository(Order);
  private itemRepo = AppDataSource.getRepository(OrderItem);
  private productRepo = AppDataSource.getRepository(Product);

  async create(data: {
    buyerId: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of data.items) {
      const product = await this.productRepo.findOneBy({ id: item.productId });
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      const orderItem = this.itemRepo.create({
        id: randomUUID(),
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
      });

      orderItems.push(orderItem);
      totalAmount += Number(product.price) * item.quantity;
    }

    const order = this.orderRepo.create({
      id: randomUUID(),
      buyerId: data.buyerId,
      totalAmount,
      items: orderItems,
    });

    const saved = await this.orderRepo.save(order);

    for (const item of data.items) {
      await this.productRepo.decrement(
        { id: item.productId },
        'stock',
        item.quantity,
      );
    }

    return this.findById(saved.id);
  }

  async findAll() {
    return this.orderRepo.find({
      relations: { items: { product: true }, buyer: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByBuyer(buyerId: string) {
    return this.orderRepo.find({
      where: { buyerId },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { items: { product: true }, buyer: true },
    });
    if (!order) throw new Error('Order not found');
    return order;
  }

  async updateStatus(id: string, orderStatus: string) {
    const order = await this.findById(id);
    order.orderStatus = orderStatus;
    return this.orderRepo.save(order);
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const order = await this.findById(id);
    order.paymentStatus = paymentStatus;
    return this.orderRepo.save(order);
  }
}
