import { Router } from 'express';
import { createOrder, getOrders, getOrder, updateOrderStatus } from './order.controller.js';

const router = Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);

export default router;
