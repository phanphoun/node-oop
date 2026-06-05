import { jest } from '@jest/globals';
import { randomUUID } from 'node:crypto';

const mockRepo = {
  find: jest.fn<(...args: any[]) => any>(),
  findOne: jest.fn<(...args: any[]) => any>(),
  findOneBy: jest.fn<(...args: any[]) => any>(),
  create: jest.fn<(...args: any[]) => any>(),
  save: jest.fn<(...args: any[]) => any>(),
  decrement: jest.fn<(...args: any[]) => any>(),
};

jest.unstable_mockModule('../database/data-source.js', () => ({
  AppDataSource: {
    getRepository: jest.fn<(...args: any[]) => any>().mockReturnValue(mockRepo),
  },
}));

const { OrderService } = await import('../modules/orders/order.service.js');

describe('OrderService', () => {
  let service: InstanceType<typeof OrderService>;
  const buyerId = randomUUID();
  const productId = randomUUID();
  const orderId = randomUUID();

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrderService();
  });

  describe('create', () => {
    it('throws if items array is empty', async () => {
      await expect(service.create({ buyerId, items: [] })).rejects.toThrow(
        'Order must have at least one item',
      );
    });

    it('throws if product not found', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.create({ buyerId, items: [{ productId, quantity: 1 }] }),
      ).rejects.toThrow(`Product not found: ${productId}`);
    });

    it('throws if stock is insufficient', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: productId, name: 'Test', stock: 0 });

      await expect(
        service.create({ buyerId, items: [{ productId, quantity: 1 }] }),
      ).rejects.toThrow('Insufficient stock for product: Test');
    });

    it('creates order and decrements stock', async () => {
      const product = { id: productId, name: 'Widget', price: 29.99, stock: 10 };
      const orderItem = { id: randomUUID(), productId, quantity: 2, price: 29.99 };
      const savedOrder = {
        id: orderId,
        buyerId,
        totalAmount: 59.98,
        items: [orderItem],
        paymentStatus: 'pending',
        orderStatus: 'pending',
      };

      mockRepo.findOneBy.mockResolvedValue(product);
      mockRepo.create.mockReturnValue(orderItem);
      mockRepo.create.mockReturnValue(savedOrder);
      mockRepo.save.mockResolvedValue(savedOrder);
      mockRepo.findOne.mockResolvedValue(savedOrder);

      const result = await service.create({
        buyerId,
        items: [{ productId, quantity: 2 }],
      });

      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: productId });
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.decrement).toHaveBeenCalledWith(
        { id: productId },
        'stock',
        2,
      );
      expect(result).toEqual(savedOrder);
    });
  });

  describe('findAll', () => {
    it('returns all orders', async () => {
      const orders = [{ id: orderId, buyerId }];
      mockRepo.find.mockResolvedValue(orders);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalledWith({
        relations: { items: { product: true }, buyer: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });
  });

  describe('findById', () => {
    it('returns order when found', async () => {
      const order = { id: orderId, buyerId };
      mockRepo.findOne.mockResolvedValue(order);

      const result = await service.findById(orderId);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
        relations: { items: { product: true }, buyer: true },
      });
      expect(result).toEqual(order);
    });

    it('throws when order not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(orderId)).rejects.toThrow('Order not found');
    });
  });

  describe('findByBuyer', () => {
    it('returns orders for a buyer', async () => {
      const orders = [{ id: orderId, buyerId }];
      mockRepo.find.mockResolvedValue(orders);

      const result = await service.findByBuyer(buyerId);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { buyerId },
        relations: { items: { product: true } },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(orders);
    });
  });

  describe('updateStatus', () => {
    it('updates order status', async () => {
      const order = { id: orderId, orderStatus: 'pending' };
      mockRepo.findOne.mockResolvedValue(order);
      mockRepo.save.mockResolvedValue({ ...order, orderStatus: 'shipped' });

      const result = await service.updateStatus(orderId, 'shipped');

      expect(order.orderStatus).toBe('shipped');
      expect(mockRepo.save).toHaveBeenCalledWith(order);
    });
  });

  describe('updatePaymentStatus', () => {
    it('updates payment status', async () => {
      const order = { id: orderId, paymentStatus: 'pending' };
      mockRepo.findOne.mockResolvedValue(order);
      mockRepo.save.mockResolvedValue({ ...order, paymentStatus: 'completed' });

      const result = await service.updatePaymentStatus(orderId, 'completed');

      expect(order.paymentStatus).toBe('completed');
      expect(mockRepo.save).toHaveBeenCalledWith(order);
    });
  });
});
