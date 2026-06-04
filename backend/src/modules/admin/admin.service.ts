import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { UserRole } from '../../constants/roles.enum.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { getPagination } from '../../core/utils/pagination.util.js';
import { User } from '../auth/user.entity.js';
import { Product } from '../product/product.entity.js';
import { Order } from '../order/order.entity.js';
import { Payment } from '../payment/payment.entity.js';

const SALT_ROUNDS = 10;

export class AdminService {
  private userRepo = AppDataSource.getRepository(User);
  private productRepo = AppDataSource.getRepository(Product);
  private orderRepo = AppDataSource.getRepository(Order);
  private paymentRepo = AppDataSource.getRepository(Payment);

  async listUsers(query: { page?: unknown; limit?: unknown } = {}) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      items: items.map((user) => this.toPublicUser(user)),
      meta: { page, limit, total },
    };
  }

  async createBusinessOwner(data: {
    name: string;
    email: string;
    password: string;
    phone?: string | null;
    address?: string | null;
  }) {
    if (!data.name?.trim()) {
      throw new BadRequestError('Name is required');
    }
    if (!data.email?.includes('@')) {
      throw new BadRequestError('Valid email is required');
    }
    if (!data.password || data.password.length < 6) {
      throw new BadRequestError('Password must be at least 6 characters');
    }

    const email = data.email.trim().toLowerCase();
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) {
      throw new BadRequestError('Email already registered');
    }

    const user = await this.userRepo.save(this.userRepo.create({
      id: randomUUID(),
      name: data.name.trim(),
      email,
      password: await bcrypt.hash(data.password, SALT_ROUNDS),
      role: UserRole.BusinessOwner,
      phone: data.phone || null,
      address: data.address || null,
      status: true,
    }));

    return this.toPublicUser(user);
  }

  async updateBusinessOwner(
    id: string,
    data: { name?: string; phone?: string | null; address?: string | null; status?: boolean },
  ) {
    const user = await this.userRepo.findOneBy({ id, role: UserRole.BusinessOwner });
    if (!user) {
      throw new NotFoundError('Business owner not found');
    }

    if (data.name !== undefined) {
      user.name = data.name;
    }
    if (data.phone !== undefined) {
      user.phone = data.phone;
    }
    if (data.address !== undefined) {
      user.address = data.address;
    }
    if (data.status !== undefined) {
      user.status = data.status;
    }

    await this.userRepo.save(user);
    return this.toPublicUser(user);
  }

  async removeBusinessOwner(id: string) {
    const user = await this.userRepo.findOneBy({ id, role: UserRole.BusinessOwner });
    if (!user) {
      throw new NotFoundError('Business owner not found');
    }

    user.status = false;
    await this.userRepo.save(user);
  }

  async analytics() {
    const [users, sellers, buyers, products, orders, payments] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { role: UserRole.BusinessOwner } }),
      this.userRepo.count({ where: { role: UserRole.Buyer } }),
      this.productRepo.count(),
      this.orderRepo.count(),
      this.paymentRepo.count(),
    ]);

    const revenue = await this.paymentRepo
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentStatus = :status', { status: 'paid' })
      .getRawOne<{ total: string }>();

    return {
      users,
      sellers,
      buyers,
      products,
      orders,
      payments,
      revenue: Number(revenue?.total || 0),
    };
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
