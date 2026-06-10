import type { NextFunction, Response } from 'express';
import { AdminService } from './admin.service.js';
import { ProductService } from '../product/product.service.js';
import { OrderService } from '../order/order.service.js';
import { NotificationService } from '../notification/notification.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { noContent, success } from '../../core/utils/response.util.js';

const adminService = new AdminService();
const productService = new ProductService();
const orderService = new OrderService();
const notificationService = new NotificationService();

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await adminService.listUsers(req.query));
  } catch (err) {
    next(err);
  }
};

export const createBusinessOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, address } = req.body as Record<string, unknown>;
    success(
      res,
      await adminService.createBusinessOwner({
        name: typeof name === 'string' ? name : '',
        email: typeof email === 'string' ? email : '',
        password: typeof password === 'string' ? password : '',
        phone: typeof phone === 'string' ? phone : null,
        address: typeof address === 'string' ? address : null,
      }),
      201,
      'Business owner created successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const updateBusinessOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, address, status } = req.body as Record<string, unknown>;
    success(
      res,
      await adminService.updateBusinessOwner(req.params.id, {
        name: typeof name === 'string' ? name : undefined,
        phone: typeof phone === 'string' ? phone : undefined,
        address: typeof address === 'string' ? address : undefined,
        status: typeof status === 'boolean' ? status : undefined,
      }),
      200,
      'Business owner updated successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const deleteBusinessOwner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.removeBusinessOwner(req.params.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await adminService.removeUser(req.params.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await productService.list({ ...req.query, includeInactive: true }));
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

export const listOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await orderService.listAll(req.query));
  } catch (err) {
    next(err);
  }
};

export const listNotifications = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await notificationService.listAll());
  } catch (err) {
    next(err);
  }
};

export const analytics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await adminService.analytics());
  } catch (err) {
    next(err);
  }
};
