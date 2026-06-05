import { Router } from 'express';
import { addToCart, getCart, removeCartItem, updateCartItem } from './cart.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.use(authenticate, requireRoles(UserRole.Buyer));
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeCartItem);

export default router;
