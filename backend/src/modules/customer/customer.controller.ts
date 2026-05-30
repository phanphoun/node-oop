import type { Request, Response } from 'express';
import { CustomerService } from './customer.service.js';

const service = new CustomerService();

export const index = async (_req: Request, res: Response) => {
  try {
    const customers = await service.findAll();
    res.json({ success: true, data: customers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const show = async (req: Request, res: Response) => {
  try {
    const customer = await service.findById(req.params.id);
    res.json({ success: true, data: customer });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, address } = req.body;

    if (!firstName || typeof firstName !== 'string' || firstName.length < 2) {
      res.status(400).json({ success: false, message: 'First name must be at least 2 characters' });
      return;
    }
    if (!lastName || typeof lastName !== 'string' || lastName.length < 2) {
      res.status(400).json({ success: false, message: 'Last name must be at least 2 characters' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Valid email is required' });
      return;
    }

    const customer = await service.create({ firstName, lastName, email, phone, address });
    res.status(201).json({ success: true, data: customer });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const customer = await service.update(req.params.id, req.body);
    res.json({ success: true, data: customer });
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
