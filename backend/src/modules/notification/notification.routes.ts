import { Router } from 'express';
import {
  createNotification,
  markNotificationRead,
  myNotifications,
} from './notification.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.get('/', authenticate, myNotifications);
router.post('/', authenticate, requireRoles(UserRole.Admin), createNotification);
router.put('/:id/read', authenticate, markNotificationRead);

export default router;
