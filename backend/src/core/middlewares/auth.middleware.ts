import type { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../constants/roles.enum.js';
import { env } from '../../config/env.config.js';
import type { AuthRequest, AuthUser } from '../../shared/interfaces/request.interface.js';
import { UnauthorizedError } from '../errors/unauthorized.error.js';

type JwtPayload = {
  sub?: string;
  role?: UserRole;
};

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing authorization token');
    }

    const token = header.slice('Bearer '.length);
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    if (!payload.sub || !payload.role || !Object.values(UserRole).includes(payload.role)) {
      throw new UnauthorizedError('Invalid authorization token');
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    } satisfies AuthUser;

    next();
  } catch (err) {
    next(err instanceof UnauthorizedError ? err : new UnauthorizedError('Invalid authorization token'));
  }
};
