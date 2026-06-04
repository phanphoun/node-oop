import type { NextFunction, Request, Response } from 'express';
import { ProductService } from './product.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { noContent, success } from '../../core/utils/response.util.js';

const productService = new ProductService();

const numberFromBody = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await productService.list(req.query));
  } catch (err) {
    next(err);
  }
};

export const topRatedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await productService.topRated(numberFromBody(req.query.limit, 10)));
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await productService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;
    success(
      res,
      await productService.create(
        {
          name: typeof body.name === 'string' ? body.name : '',
          description: typeof body.description === 'string' ? body.description : null,
          price: numberFromBody(body.price),
          stock: numberFromBody(body.stock),
          categoryId: typeof body.categoryId === 'string' ? body.categoryId : null,
          image: typeof body.image === 'string' ? body.image : null,
          sku: typeof body.sku === 'string' ? body.sku : null,
          sellerId: typeof body.sellerId === 'string' ? body.sellerId : null,
        },
        req.user!,
      ),
      201,
      'Product created successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = req.body as Record<string, unknown>;
    success(
      res,
      await productService.update(
        req.params.id,
        {
          name: typeof body.name === 'string' ? body.name : undefined,
          description: typeof body.description === 'string' ? body.description : undefined,
          price: body.price !== undefined ? numberFromBody(body.price) : undefined,
          stock: body.stock !== undefined ? numberFromBody(body.stock) : undefined,
          categoryId: typeof body.categoryId === 'string' ? body.categoryId : undefined,
          image: typeof body.image === 'string' ? body.image : undefined,
          sku: typeof body.sku === 'string' ? body.sku : undefined,
          status: typeof body.status === 'boolean' ? body.status : undefined,
        },
        req.user!,
      ),
      200,
      'Product updated successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await productService.delete(req.params.id, req.user!);
    noContent(res);
  } catch (err) {
    next(err);
  }
};
