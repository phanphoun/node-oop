import type { NextFunction, Response } from 'express';
import { PaymentService } from './payment.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { UserRole } from '../../constants/roles.enum.js';
import { success } from '../../core/utils/response.util.js';

const paymentService = new PaymentService();

export const payWithPayPal = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body as Record<string, unknown>;
    success(
      res,
      await paymentService.payWithPayPal(req.user!.id, typeof orderId === 'string' ? orderId : ''),
      201,
      'PayPal payment processed',
    );
  } catch (err) {
    next(err);
  }
};

export const listPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === UserRole.Admin) {
      success(res, await paymentService.listAll(req.query));
      return;
    }
    if (req.user!.role === UserRole.BusinessOwner) {
      success(res, await paymentService.listForSeller(req.user!.id, req.query));
      return;
    }

    success(res, await paymentService.listForBuyer(req.user!.id, req.query));
  } catch (err) {
    next(err);
  }
};

export const getPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await paymentService.getById(req.params.id, req.user!));
  } catch (err) {
    next(err);
  }
};
