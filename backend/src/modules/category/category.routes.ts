import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from './category.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, requireRoles(UserRole.Admin), createCategory);
router.put('/:id', authenticate, requireRoles(UserRole.Admin), updateCategory);
router.delete('/:id', authenticate, requireRoles(UserRole.Admin), deleteCategory);

export default router;
