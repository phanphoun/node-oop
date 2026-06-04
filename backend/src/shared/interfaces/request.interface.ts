import type { Request } from 'express';
import type { UserRole } from '../../constants/roles.enum.js';

export type AuthUser = {
  id: string;
  role: UserRole;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};
