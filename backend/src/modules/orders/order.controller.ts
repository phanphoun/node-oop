import type { Request, Response } from 'express';
import { OrderService } from './order.service.js';

const orderService = new OrderService();

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { customerId, total } = req.body;
        if (!customerId || typeof customerId !== 'string') {
            res.status(400).json({ success: false, message: 'customerId is required' });
            return;
        }

        const order = await orderService.create({ customerId, total });
        res.status(201).json({ success: true, data: order });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await orderService.findAll();
        res.json({ success: true, data: orders });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const order = await orderService.findById(id);
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        res.json({ success: true, data: order });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};


export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || typeof status !== 'string') {
            res.status(400).json({ success: false, message: 'status is required' });
            return;
        }

        const order = await orderService.updateStatus(id, status);
        res.json({ success: true, data: order });
    } catch (err: any) {
        res.status(400).json({ success: false, message: err.message });
    }
};
