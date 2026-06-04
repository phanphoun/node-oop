import type { NextFunction, Response } from 'express';
import type { UserRole } from '../../constants/roles.enum.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { ForbiddenError } from '../errors/forbidden.error.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';

export const requireRoles = (...roles: UserRole[]) => (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }

  if (!roles.includes(req.user.role)) {
    next(new ForbiddenError('You do not have permission to access this resource'));
    return;
  }

  next();
};
