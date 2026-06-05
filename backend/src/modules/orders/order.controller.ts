import type { Request, Response } from 'express';
import { OrderService } from './order.service.js';

const service = new OrderService();

export const store = async (req: Request, res: Response) => {
  try {
    const { buyerId, items } = req.body;

    if (!buyerId || typeof buyerId !== 'string') {
      res.status(400).json({ success: false, message: 'buyerId is required' });
      return;
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must have at least one item' });
      return;
    }
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        res.status(400).json({ success: false, message: 'Each item must have a productId and quantity >= 1' });
        return;
      }
    }

    const order = await service.create({ buyerId, items });
    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const index = async (req: Request, res: Response) => {
  try {
    const orders = await service.findAll();
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const order = await service.findById(req.params.id);
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { orderStatus } = req.body;
    if (!orderStatus || typeof orderStatus !== 'string') {
      res.status(400).json({ success: false, message: 'orderStatus is required' });
      return;
    }

    const order = await service.updateStatus(req.params.id, orderStatus);
    res.json({ success: true, data: order });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const buyerOrders = async (req: Request, res: Response) => {
  try {
    const { buyerId } = req.params;
    const orders = await service.findByBuyer(buyerId);
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
