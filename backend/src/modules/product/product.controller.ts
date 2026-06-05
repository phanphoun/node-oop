import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';

const service = new ProductService();

export const index = async (_req: Request, res: Response) => {
  try {
    const products = await service.findAll();
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const product = await service.findById(req.params.id);
    res.json({ success: true, data: product });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      sku,
      stock,
      status,
      categoryId,
      category_id,
      image,
      sellerId,
      seller_id,
    } = req.body;

    if (!name || typeof name !== 'string' || name.length < 2) {
      res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
      return;
    }
    if (price === undefined || typeof price !== 'number' || price < 0) {
      res.status(400).json({ success: false, message: 'Price must be a positive number' });
      return;
    }
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      res.status(400).json({ success: false, message: 'Stock must be a non-negative integer' });
      return;
    }

    const product = await service.create({
      name,
      description,
      price,
      sku,
      stock,
      status,
      categoryId: categoryId ?? category_id,
      image,
      sellerId: sellerId ?? seller_id,
    });
    res.status(201).json({ success: true, data: product });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { name, price, stock } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.length < 2)) {
      res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
      return;
    }
    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      res.status(400).json({ success: false, message: 'Price must be a positive number' });
      return;
    }
    if (stock !== undefined && (!Number.isInteger(stock) || stock < 0)) {
      res.status(400).json({ success: false, message: 'Stock must be a non-negative integer' });
      return;
    }

    const product = await service.update(req.params.id, {
      ...req.body,
      categoryId: req.body.categoryId ?? req.body.category_id,
      sellerId: req.body.sellerId ?? req.body.seller_id,
    });
    res.json({ success: true, data: product });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const destroy = async (req: Request, res: Response) => {
  try {
    const result = await service.delete(req.params.id);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};
