import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { Product } from './product.entity.js';

export class ProductService {
  private repo = AppDataSource.getRepository(Product);

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const product = await this.repo.findOneBy({ id });
    if (!product) throw new Error('Product not found');
    return product;
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    sku?: string;
    stock?: number;
    status?: boolean;
  }) {
    if (data.sku) {
      const existing = await this.repo.findOneBy({ sku: data.sku });
      if (existing) throw new Error('SKU already exists');
    }

    const product = this.repo.create({
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      sku: data.sku ?? null,
      stock: data.stock ?? 0,
      status: data.status ?? true,
    });

    return this.repo.save(product);
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      sku?: string;
      stock?: number;
      status?: boolean;
    }
  ) {
    const product = await this.findById(id);

    if (data.sku && data.sku !== product.sku) {
      const existing = await this.repo.findOneBy({ sku: data.sku });
      if (existing) throw new Error('SKU already in use');
    }

    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.sku !== undefined) product.sku = data.sku;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.status !== undefined) product.status = data.status;

    return this.repo.save(product);
  }

  async delete(id: string) {
    const product = await this.findById(id);
    await this.repo.remove(product);
    return { message: 'Product deleted successfully' };
  }
}
