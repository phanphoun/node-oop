import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { Product } from '../product/product.entity.js';
import { Favorite } from './favorite.entity.js';

export class FavoriteService {
  private favoriteRepo = AppDataSource.getRepository(Favorite);
  private productRepo = AppDataSource.getRepository(Product);

  async list(buyerId: string) {
    return this.favoriteRepo.find({
      where: { buyerId },
      relations: { product: { category: true, seller: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async add(buyerId: string, productId: string) {
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    const product = await this.productRepo.findOneBy({ id: productId, status: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const existing = await this.favoriteRepo.findOneBy({ buyerId, productId });
    if (existing) {
      return existing;
    }

    return this.favoriteRepo.save(this.favoriteRepo.create({
      id: randomUUID(),
      buyerId,
      productId,
    }));
  }

  async remove(buyerId: string, id: string) {
    const favorite = await this.favoriteRepo.findOne({
      where: [{ id, buyerId }, { productId: id, buyerId }],
    });

    if (!favorite) {
      throw new NotFoundError('Favorite not found');
    }

    await this.favoriteRepo.remove(favorite);
  }
}
