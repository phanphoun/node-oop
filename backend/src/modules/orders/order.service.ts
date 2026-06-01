import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { Order } from './order.entity.js';

export class OrderService {
    private repo = AppDataSource.getRepository(Order);

    async create(data: { customerId: string; total?: number }) {
        const order = this.repo.create({
            id: randomUUID(),
            customerId: data.customerId,
            total: data.total ?? 0,
            status: 'pending',
        });

        await this.repo.save(order);
        return order;
    }

    async findAll() {
        return this.repo.find({ relations: ['customer'] });
    }

    async findById(id: string) {
        return this.repo.findOne({ where: { id }, relations: ['customer'] });
    }

    async updateStatus(id: string, status: string) {
        const order = await this.repo.findOneBy({ id });
        if (!order) throw new Error('Order not found');
        order.status = status;
        await this.repo.save(order);
        return order;
    }
}
