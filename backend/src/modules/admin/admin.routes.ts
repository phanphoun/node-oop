import { Router } from 'express';
import {
  analytics,
  createBusinessOwner,
  deleteBusinessOwner,
  deleteProduct,
  listNotifications,
  listOrders,
  listProducts,
  listUsers,
  updateBusinessOwner,
} from './admin.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.use(authenticate, requireRoles(UserRole.Admin));

router.get('/users', listUsers);
router.post('/business-owner', createBusinessOwner);
router.put('/business-owner/:id', updateBusinessOwner);
router.delete('/business-owner/:id', deleteBusinessOwner);
router.get('/products', listProducts);
router.delete('/products/:id', deleteProduct);
router.get('/orders', listOrders);
router.get('/notifications', listNotifications);
router.get('/analytics', analytics);

export default router;
