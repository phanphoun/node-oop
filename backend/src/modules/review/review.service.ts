import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { Product } from '../product/product.entity.js';
import { Review } from './review.entity.js';

export class ReviewService {
  private get reviewRepo() { return AppDataSource.getRepository(Review); }
  private get productRepo() { return AppDataSource.getRepository(Product); }

  async listByProduct(productId: string) {
    const reviews = await this.reviewRepo.find({
      where: { productId },
      relations: { buyer: true },
      order: { createdAt: 'DESC' },
    });

    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      items: reviews,
      meta: {
        count: reviews.length,
        averageRating: Number(averageRating.toFixed(2)),
      },
    };
  }

  async create(buyerId: string, data: { productId: string; rating: number; comment?: string | null }) {
    if (!data.productId) {
      throw new BadRequestError('Product ID is required');
    }
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }

    const product = await this.productRepo.findOneBy({ id: data.productId, status: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const existing = await this.reviewRepo.findOneBy({ buyerId, productId: data.productId });
    if (existing) {
      existing.rating = data.rating;
      existing.comment = data.comment || null;
      return this.reviewRepo.save(existing);
    }

    return this.reviewRepo.save(this.reviewRepo.create({
      id: randomUUID(),
      buyerId,
      productId: data.productId,
      rating: data.rating,
      comment: data.comment || null,
    }));
  }
}
