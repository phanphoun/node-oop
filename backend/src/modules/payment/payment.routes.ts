import { Router } from 'express';
import { getPayment, listPayments, payWithPayPal } from './payment.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.use(authenticate);
router.get('/', listPayments);
router.get('/:id', getPayment);
router.post('/paypal', requireRoles(UserRole.Buyer), payWithPayPal);

export default router;
