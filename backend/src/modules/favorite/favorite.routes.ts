import { Router } from 'express';
import { addFavorite, listFavorites, removeFavorite } from './favorite.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.use(authenticate, requireRoles(UserRole.Buyer));
router.get('/', listFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

export default router;
