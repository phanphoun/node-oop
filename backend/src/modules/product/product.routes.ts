import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  topRatedProducts,
  updateProduct,
} from './product.controller.js';
import { authenticate } from '../../core/middlewares/auth.middleware.js';
import { requireRoles } from '../../core/middlewares/role.middleware.js';
import { UserRole } from '../../constants/roles.enum.js';

const router = Router();

router.get('/', listProducts);
router.get('/search', listProducts);
router.get('/top-rated', topRatedProducts);
router.get('/category/:category', (req, _res, next) => {
  req.query.category = req.params.category;
  next();
}, listProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, requireRoles(UserRole.Admin, UserRole.BusinessOwner), createProduct);
router.put('/:id', authenticate, requireRoles(UserRole.Admin, UserRole.BusinessOwner), updateProduct);
router.delete('/:id', authenticate, requireRoles(UserRole.Admin, UserRole.BusinessOwner), deleteProduct);

export default router;
