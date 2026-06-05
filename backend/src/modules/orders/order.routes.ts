import { Router } from 'express';
import { store, index, show, updateStatus, buyerOrders } from './order.controller.js';

const router = Router();

router.post('/', store);
router.get('/', index);
router.get('/buyer/:buyerId', buyerOrders);
router.get('/:id', show);
router.patch('/:id/status', updateStatus);

export default router;
