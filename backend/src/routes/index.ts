import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import sellerRoutes from '../modules/seller/seller.routes.js';
import categoryRoutes from '../modules/category/category.routes.js';
import productRoutes from '../modules/product/product.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import favoriteRoutes from '../modules/favorite/favorite.routes.js';
import reviewRoutes from '../modules/review/review.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import paymentRoutes from '../modules/payment/payment.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import { checkout } from '../modules/order/order.controller.js';
import { authenticate } from '../core/middlewares/auth.middleware.js';
import { requireRoles } from '../core/middlewares/role.middleware.js';
import { UserRole } from '../constants/roles.enum.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/seller', sellerRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);

router.post('/checkout', authenticate, requireRoles(UserRole.Buyer), checkout);

export default router;
