import type { NextFunction, Response } from 'express';
import { CartService } from './cart.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { noContent, success } from '../../core/utils/response.util.js';

const cartService = new CartService();

const toQuantity = (value: unknown, fallback = 1) => {
  const quantity = Number(value);
  return Number.isInteger(quantity) ? quantity : fallback;
};

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await cartService.getCart(req.user!.id));
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body as Record<string, unknown>;
    success(
      res,
      await cartService.addItem(req.user!.id, {
        productId: typeof productId === 'string' ? productId : '',
        quantity: toQuantity(quantity),
      }),
      201,
      'Product added to cart',
    );
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { quantity } = req.body as Record<string, unknown>;
    success(
      res,
      await cartService.updateItem(req.user!.id, req.params.id, toQuantity(quantity, 0)),
      200,
      'Cart updated successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await cartService.removeItem(req.user!.id, req.params.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
};
