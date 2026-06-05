import { Router } from 'express';
import { show, addItem, updateItem, removeItem } from './cart.controller.js';

const router = Router();

router.get('/:buyerId', show);
router.post('/items', addItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', removeItem);

export default router;
