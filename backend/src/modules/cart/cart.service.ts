import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { Cart, CartItem } from './cart.entity.js';
import { Product } from '../product/product.entity.js';

export class CartService {
  private cartRepo = AppDataSource.getRepository(Cart);
  private itemRepo = AppDataSource.getRepository(CartItem);
  private productRepo = AppDataSource.getRepository(Product);

  async getOrCreateCart(buyerId: string) {
    let cart = await this.cartRepo.findOne({
      where: { buyerId },
      relations: { items: { product: true } },
    });

    if (!cart) {
      cart = this.cartRepo.create({
        id: randomUUID(),
        buyerId,
      });
      cart = await this.cartRepo.save(cart);
    }

    return cart;
  }

  async getCart(buyerId: string) {
    const cart = await this.cartRepo.findOne({
      where: { buyerId },
      relations: { items: { product: true } },
      order: { items: { product: { name: 'ASC' } } },
    });

    if (!cart) {
      return this.getOrCreateCart(buyerId);
    }

    return cart;
  }

  async addItem(buyerId: string, productId: string, quantity: number) {
    const product = await this.productRepo.findOneBy({ id: productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const cart = await this.getOrCreateCart(buyerId);

    const existingItem = cart.items?.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      await this.itemRepo.save(existingItem);
      return this.getCart(buyerId);
    }

    const item = this.itemRepo.create({
      id: randomUUID(),
      cartId: cart.id,
      productId,
      quantity,
    });

    await this.itemRepo.save(item);
    return this.getCart(buyerId);
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const item = await this.itemRepo.findOneBy({ id: cartItemId });
    if (!item) {
      throw new Error('Cart item not found');
    }

    item.quantity = quantity;
    await this.itemRepo.save(item);
  }

  async removeItem(cartItemId: string) {
    const item = await this.itemRepo.findOneBy({ id: cartItemId });
    if (!item) {
      throw new Error('Cart item not found');
    }

    await this.itemRepo.remove(item);
  }

  async clearCart(buyerId: string) {
    const cart = await this.cartRepo.findOne({
      where: { buyerId },
      relations: { items: true },
    });

    if (cart) {
      await this.itemRepo.remove(cart.items);
    }
  }
}
