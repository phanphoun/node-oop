import { randomUUID } from 'node:crypto';
import { Brackets } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { UserRole } from '../../constants/roles.enum.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { ForbiddenError } from '../../core/errors/forbidden.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { getPagination } from '../../core/utils/pagination.util.js';
import { toOptionalNumber, toOptionalString } from '../../core/utils/query.util.js';
import { User } from '../auth/user.entity.js';
import { Category } from '../category/category.entity.js';
import { Product } from './product.entity.js';

export type ProductListQuery = {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  category?: unknown;
  minPrice?: unknown;
  maxPrice?: unknown;
  sort?: unknown;
  includeInactive?: unknown;
  sellerId?: unknown;
};

export class ProductService {
  private get productRepo() { return AppDataSource.getRepository(Product); }
  private get categoryRepo() { return AppDataSource.getRepository(Category); }
  private get userRepo() { return AppDataSource.getRepository(User); }

  async list(query: ProductListQuery = {}, actor?: { role: UserRole }) {
    const { page, limit, skip } = getPagination(query);
    const search = toOptionalString(query.search);
    const category = toOptionalString(query.category);
    const minPrice = toOptionalNumber(query.minPrice);
    const maxPrice = toOptionalNumber(query.maxPrice);
    const sort = toOptionalString(query.sort);
    const sellerId = toOptionalString(query.sellerId);
    const includeInactive =
      query.includeInactive === 'true' || query.includeInactive === true;

    if (includeInactive && (!actor || !(actor.role === UserRole.Admin || actor.role === UserRole.BusinessOwner))) {
      throw new ForbiddenError('Including inactive products requires seller or admin access');
    }

    const builder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .loadRelationCountAndMap('product.reviewCount', 'product.reviews')
      .skip(skip)
      .take(limit);

    if (!includeInactive) {
      builder.andWhere('product.status = :status', { status: true });
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('product.name LIKE :search', { search: `%${search}%` })
            .orWhere('product.description LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (category) {
      builder.andWhere('(category.name = :category OR product.categoryId = :category)', { category });
    }

    if (sellerId) {
      builder.andWhere('product.sellerId = :sellerId', { sellerId });
    }

    if (minPrice !== undefined) {
      builder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      builder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    switch (sort) {
      case 'price_asc':
        builder.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        builder.orderBy('product.price', 'DESC');
        break;
      case 'name':
        builder.orderBy('product.name', 'ASC');
        break;
      default:
        builder.orderBy('product.createdAt', 'DESC');
    }

    const [items, total] = await builder.getManyAndCount();

    return {
      items,
      meta: { page, limit, total },
    };
  }

  async listBySeller(sellerId: string, query: ProductListQuery = {}) {
    return this.list({ ...query, sellerId, includeInactive: true });
  }

  async topRated(limit = 10) {
    return this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoin('product.reviews', 'review')
      .where('product.status = :status', { status: true })
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .orderBy('avgRating', 'DESC')
      .limit(Math.min(Math.max(limit, 1), 50))
      .getMany();
  }

  async getById(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true, seller: true, reviews: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async create(
    data: {
      name: string;
      description?: string | null;
      price: number;
      stock?: number;
      categoryId?: string | null;
      image?: string | null;
      sku?: string | null;
      sellerId?: string | null;
    },
    actor: { id: string; role: UserRole },
  ) {
    await this.validateProductInput(data);
    const sellerId = actor.role === UserRole.Admin ? data.sellerId || actor.id : actor.id;
    await this.ensureSeller(sellerId);

    const product = this.productRepo.create({
      id: randomUUID(),
      name: data.name.trim(),
      description: data.description || null,
      price: data.price,
      stock: data.stock || 0,
      categoryId: data.categoryId || null,
      image: data.image || null,
      sku: data.sku || null,
      sellerId,
      status: true,
    });

    return this.productRepo.save(product);
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      price: number;
      stock: number;
      categoryId: string | null;
      image: string | null;
      sku: string | null;
      status: boolean;
    }>,
    actor: { id: string; role: UserRole },
  ) {
    const product = await this.getById(id);
    this.assertCanManage(product, actor);

    if (data.categoryId !== undefined && data.categoryId !== null) {
      await this.ensureCategory(data.categoryId);
    }

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        throw new BadRequestError('Product name is required');
      }
      product.name = data.name.trim();
    }
    if (data.description !== undefined) {
      product.description = data.description;
    }
    if (data.price !== undefined) {
      if (data.price < 0) {
        throw new BadRequestError('Price cannot be negative');
      }
      product.price = data.price;
    }
    if (data.stock !== undefined) {
      if (data.stock < 0) {
        throw new BadRequestError('Stock cannot be negative');
      }
      product.stock = data.stock;
    }
    if (data.categoryId !== undefined) {
      product.categoryId = data.categoryId;
    }
    if (data.image !== undefined) {
      product.image = data.image;
    }
    if (data.sku !== undefined) {
      product.sku = data.sku;
    }
    if (data.status !== undefined) {
      product.status = data.status;
    }

    return this.productRepo.save(product);
  }

  async delete(id: string, actor: { id: string; role: UserRole }) {
    const product = await this.getById(id);
    this.assertCanManage(product, actor);
    product.status = false;
    await this.productRepo.save(product);
  }

  private async validateProductInput(data: {
    name: string;
    price: number;
    stock?: number;
    categoryId?: string | null;
  }) {
    if (!data.name?.trim()) {
      throw new BadRequestError('Product name is required');
    }
    if (!Number.isFinite(data.price) || data.price < 0) {
      throw new BadRequestError('Valid product price is required');
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new BadRequestError('Stock cannot be negative');
    }
    if (data.categoryId) {
      await this.ensureCategory(data.categoryId);
    }
  }

  private async ensureCategory(categoryId: string) {
    const category = await this.categoryRepo.findOneBy({ id: categoryId });
    if (!category) {
      throw new BadRequestError('Category does not exist');
    }
  }

  private async ensureSeller(sellerId: string) {
    const seller = await this.userRepo.findOneBy({ id: sellerId });
    if (!seller || (seller.role !== UserRole.BusinessOwner && seller.role !== UserRole.Admin)) {
      throw new BadRequestError('Seller must be an admin or business owner account');
    }
  }

  private assertCanManage(product: Product, actor: { id: string; role: UserRole }) {
    if (actor.role === UserRole.Admin) {
      return;
    }
    if (actor.role === UserRole.BusinessOwner && product.sellerId === actor.id) {
      return;
    }

    throw new ForbiddenError('You can only manage your own products');
  }
}
