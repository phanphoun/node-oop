import { Router } from 'express';
import { checkout, getOrder, listOrders, updateOrderStatus } from './order.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.use(authenticate);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.put('/:id/status', requireRoles(UserRole.Admin, UserRole.BusinessOwner), updateOrderStatus);
router.post('/checkout', requireRoles(UserRole.Buyer), checkout);

export default router;
