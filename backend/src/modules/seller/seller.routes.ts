import { Router } from 'express';
import {
  createSellerProduct,
  deleteSellerProduct,
  listSellerOrders,
  listSellerPayments,
  listSellerProducts,
  updateSellerProduct,
  updateSellerProfile,
} from './seller.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.use(authenticate, requireRoles(UserRole.BusinessOwner));

router.get('/products', listSellerProducts);
router.post('/products', createSellerProduct);
router.put('/products/:id', updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);
router.get('/orders', listSellerOrders);
router.get('/payments', listSellerPayments);
router.put('/profile', updateSellerProfile);

export default router;
