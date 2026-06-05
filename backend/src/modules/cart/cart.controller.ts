import type { Request, Response } from 'express';
import { CartService } from './cart.service.js';

const service = new CartService();

export const show = async (req: Request, res: Response) => {
  try {
    const buyerId = req.params.buyerId || req.query.buyerId as string;
    if (!buyerId) {
      res.status(400).json({ success: false, message: 'buyerId is required' });
      return;
    }

    const cart = await service.getCart(buyerId);
    res.json({ success: true, data: cart });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const { buyerId, productId, quantity } = req.body;

    if (!buyerId || typeof buyerId !== 'string') {
      res.status(400).json({ success: false, message: 'buyerId is required' });
      return;
    }
    if (!productId || typeof productId !== 'string') {
      res.status(400).json({ success: false, message: 'productId is required' });
      return;
    }
    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      res.status(400).json({ success: false, message: 'quantity must be at least 1' });
      return;
    }

    const cart = await service.addItem(buyerId, productId, quantity);
    res.status(201).json({ success: true, data: cart });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      res.status(400).json({ success: false, message: 'quantity must be at least 1' });
      return;
    }

    await service.updateItemQuantity(req.params.id, quantity);
    res.json({ success: true, message: 'Cart item updated' });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    await service.removeItem(req.params.id);
    res.json({ success: true, message: 'Cart item removed' });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};
