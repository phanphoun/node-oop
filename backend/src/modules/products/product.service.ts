import { FindOptionsWhere, Like, Between, FindManyOptions } from 'typeorm';
import { productRepository } from './product.repository.ts';
import { Product } from './product.entity.ts';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './product.dto.ts';
import { NotFoundError } from '../../core/errors/not-found.error.ts';

export class ProductService {
  async findAll(query: ProductQueryDto) {
    const {
      search,
      category_id,
      min_price,
      max_price,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = query;

    const where: FindOptionsWhere<Product> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (min_price !== undefined && max_price !== undefined) {
      where.price = Between(min_price, max_price);
    } else if (min_price !== undefined) {
      where.price = Between(min_price, Number.MAX_SAFE_INTEGER);
    } else if (max_price !== undefined) {
      where.price = Between(0, max_price);
    }

    const order: FindManyOptions<Product>['order'] = {};
    switch (sort) {
      case 'price_asc':
        order.price = 'ASC';
        break;
      case 'price_desc':
        order.price = 'DESC';
        break;
      case 'name_asc':
        order.name = 'ASC';
        break;
      case 'name_desc':
        order.name = 'DESC';
        break;
      case 'oldest':
        order.created_at = 'ASC';
        break;
      case 'newest':
      default:
        order.created_at = 'DESC';
        break;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await productRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const product = await productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async create(data: CreateProductDto) {
    const product = productRepository.create(data);
    return await productRepository.save(product);
  }

  async update(id: string, data: UpdateProductDto) {
    await this.findById(id);
    await productRepository.update(id, data);
    return await productRepository.findOneBy({ id });
  }

  async delete(id: string) {
    await this.findById(id);
    return await productRepository.delete(id);
  }
}
