import type { NextFunction, Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { success } from '../../core/utils/response.util.js';

const notificationService = new NotificationService();

export const myNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await notificationService.listForUser(req.user!.id));
  } catch (err) {
    next(err);
  }
};

export const allNotifications = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await notificationService.listAll());
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, type, title, message } = req.body as Record<string, unknown>;
    success(
      res,
      await notificationService.create({
        userId: typeof userId === 'string' ? userId : null,
        type: typeof type === 'string' ? type : 'admin_alert',
        title: typeof title === 'string' ? title : 'Notification',
        message: typeof message === 'string' ? message : '',
      }),
      201,
      'Notification created successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await notificationService.markRead(req.params.id, req.user!.id));
  } catch (err) {
    next(err);
  }
};
