import { Router } from 'express';
import { createReview, listProductReviews } from './review.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.get('/:productId', listProductReviews);
router.post('/', authenticate, requireRoles(UserRole.Buyer), createReview);

export default router;
