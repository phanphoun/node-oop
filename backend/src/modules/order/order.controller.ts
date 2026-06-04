import type { NextFunction, Response } from 'express';
import { OrderService } from './order.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { UserRole } from '../../constants/roles.enum.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { success } from '../../core/utils/response.util.js';

const orderService = new OrderService();

export const checkout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await orderService.checkout(req.user!.id), 201, 'Order created successfully');
  } catch (err) {
    next(err);
  }
};

export const listOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === UserRole.Admin) {
      success(res, await orderService.listAll(req.query));
      return;
    }

    if (req.user!.role === UserRole.BusinessOwner) {
      success(res, await orderService.listForSeller(req.user!.id, req.query));
      return;
    }

    success(res, await orderService.listForBuyer(req.user!.id, req.query));
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await orderService.getById(req.params.id, req.user!));
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderStatus, paymentStatus } = req.body as Record<string, unknown>;

    if (orderStatus !== undefined && !orderService.isValidOrderStatus(orderStatus)) {
      throw new BadRequestError('Invalid order status');
    }
    if (paymentStatus !== undefined && !orderService.isValidPaymentStatus(paymentStatus)) {
      throw new BadRequestError('Invalid payment status');
    }

    success(
      res,
      await orderService.updateStatus(
        req.params.id,
        { orderStatus, paymentStatus },
        req.user!,
      ),
      200,
      'Order updated successfully',
    );
  } catch (err) {
    next(err);
  }
};
