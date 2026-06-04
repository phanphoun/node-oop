import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import customerRoutes from '../modules/customer/customer.routes.js';
import productRoutes from '../modules/product/product.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);

export default router;
