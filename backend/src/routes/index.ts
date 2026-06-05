import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import customerRoutes from '../modules/customer/customer.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import orderRoutes from '../modules/orders/order.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);

export default router;
