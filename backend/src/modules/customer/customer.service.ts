import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { Customer } from './customer.entity.js';

export class CustomerService {
  private repo = AppDataSource.getRepository(Customer);

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const customer = await this.repo.findOneBy({ id });
    if (!customer) throw new Error('Customer not found');
    return customer;
  }

  async create(data: { firstName: string; lastName: string; email: string; phone?: string; address?: string }) {
    const existing = await this.repo.findOneBy({ email: data.email });
    if (existing) throw new Error('Email already registered');

    const customer = this.repo.create({
      id: randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      address: data.address ?? null,
    });

    return this.repo.save(customer);
  }

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string }) {
    const customer = await this.findById(id);

    if (data.email && data.email !== customer.email) {
      const existing = await this.repo.findOneBy({ email: data.email });
      if (existing) throw new Error('Email already in use');
    }

    if (data.firstName !== undefined) customer.firstName = data.firstName;
    if (data.lastName !== undefined) customer.lastName = data.lastName;
    if (data.email !== undefined) customer.email = data.email;
    if (data.phone !== undefined) customer.phone = data.phone;
    if (data.address !== undefined) customer.address = data.address;

    return this.repo.save(customer);
  }

  async delete(id: string) {
    const customer = await this.findById(id);
    await this.repo.remove(customer);
    return { message: 'Customer deleted successfully' };
  }
}
