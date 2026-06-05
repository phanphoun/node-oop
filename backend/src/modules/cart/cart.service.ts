import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { Product } from '../product/product.entity.js';
import { Cart } from './cart.entity.js';
import { CartItem } from './cart-item.entity.js';

export class CartService {
  private cartRepo = AppDataSource.getRepository(Cart);
  private cartItemRepo = AppDataSource.getRepository(CartItem);
  private productRepo = AppDataSource.getRepository(Product);

  async getCart(buyerId: string) {
    let cart = await this.cartRepo.findOne({
      where: { buyerId },
      relations: { items: { product: true } },
    });

    if (!cart) {
      cart = await this.cartRepo.save(this.cartRepo.create({ id: randomUUID(), buyerId }));
      cart.items = [];
    }

    return cart;
  }

  async addItem(buyerId: string, data: { productId: string; quantity: number }) {
    if (!data.productId) {
      throw new BadRequestError('Product ID is required');
    }
    if (!Number.isInteger(data.quantity) || data.quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const product = await this.productRepo.findOneBy({ id: data.productId, status: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    if (product.stock < data.quantity) {
      throw new BadRequestError('Not enough product stock');
    }

    const cart = await this.getCart(buyerId);
    let item = await this.cartItemRepo.findOneBy({ cartId: cart.id, productId: data.productId });

    if (item) {
      item.quantity += data.quantity;
      if (item.quantity > product.stock) {
        throw new BadRequestError('Not enough product stock');
      }
    } else {
      item = this.cartItemRepo.create({
        id: randomUUID(),
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
      });
    }

    await this.cartItemRepo.save(item);
    return this.getCart(buyerId);
  }

  async updateItem(buyerId: string, itemId: string, quantity: number) {
    const cart = await this.getCart(buyerId);
    const item = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: { product: true },
    });

    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartItemRepo.remove(item);
      return this.getCart(buyerId);
    }

    if (!Number.isInteger(quantity)) {
      throw new BadRequestError('Quantity must be a whole number');
    }
    if (item.product.stock < quantity) {
      throw new BadRequestError('Not enough product stock');
    }

    item.quantity = quantity;
    await this.cartItemRepo.save(item);
    return this.getCart(buyerId);
  }

  async removeItem(buyerId: string, itemId: string) {
    const cart = await this.getCart(buyerId);
    const item = await this.cartItemRepo.findOneBy({ id: itemId, cartId: cart.id });
    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    await this.cartItemRepo.remove(item);
  }

  async clearCart(cartId: string) {
    await this.cartItemRepo.delete({ cartId });
  }
}
