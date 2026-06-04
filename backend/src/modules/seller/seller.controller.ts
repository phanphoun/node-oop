import type { NextFunction, Response } from 'express';
import { ProductService } from '../product/product.service.js';
import { OrderService } from '../order/order.service.js';
import { PaymentService } from '../payment/payment.service.js';
import { AuthService } from '../auth/auth.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { noContent, success } from '../../core/utils/response.util.js';

const productService = new ProductService();
const orderService = new OrderService();
const paymentService = new PaymentService();
const authService = new AuthService();

const numberFromBody = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const listSellerProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await productService.listBySeller(req.user!.id, req.query));
  } catch (err) {
    next(err);
  }
};

export const createSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
          sellerId: req.user!.id,
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

export const updateSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const deleteSellerProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await productService.delete(req.params.id, req.user!);
    noContent(res);
  } catch (err) {
    next(err);
  }
};

export const listSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await orderService.listForSeller(req.user!.id, req.query));
  } catch (err) {
    next(err);
  }
};

export const listSellerPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await paymentService.listForSeller(req.user!.id, req.query));
  } catch (err) {
    next(err);
  }
};

export const updateSellerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, address } = req.body as Record<string, unknown>;
    success(
      res,
      await authService.updateProfile(req.user!.id, {
        name: typeof name === 'string' ? name : undefined,
        phone: typeof phone === 'string' ? phone : undefined,
        address: typeof address === 'string' ? address : undefined,
      }),
      200,
      'Seller profile updated successfully',
    );
  } catch (err) {
    next(err);
  }
};
