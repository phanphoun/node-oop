import type { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { UserRole } from '../../constants/roles.enum.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { success } from '../../core/utils/response.util.js';

const authService = new AuthService();

const validateRegistration = (req: Request) => {
  const { name, email, password, role, phone, address, profileImage } = req.body as Record<string, unknown>;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new BadRequestError('Name must be at least 2 characters');
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new BadRequestError('Valid email is required');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters');
  }

  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedPassword = typeof password === 'string' ? password : '';
  const normalizedPhone = typeof phone === 'string' ? phone : undefined;
  const normalizedAddress = typeof address === 'string' ? address : undefined;
  const normalizedProfileImage = typeof profileImage === 'string' ? profileImage : undefined;

  return {
    name: normalizedName,
    email: normalizedEmail,
    password: normalizedPassword,
    phone: normalizedPhone,
    address: normalizedAddress,
    profileImage: normalizedProfileImage,
  };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(validateRegistration(req));
    success(res, result, 201, 'User registered successfully');
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as Record<string, unknown>;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new BadRequestError('Valid email is required');
    }
    if (!password || typeof password !== 'string') {
      throw new BadRequestError('Password is required');
    }

    const result = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });
    success(res, result, 200, 'User logged in successfully');
  } catch (err) {
    next(err);
  }
};

export const logout = async (_req: Request, res: Response) => {
  success(res, null, 200, 'Logged out successfully');
};

export const profile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.getProfile(req.user!.id);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, address, profileImage } = req.body as Record<string, unknown>;
    const result = await authService.updateProfile(req.user!.id, {
      name: typeof name === 'string' ? name.trim() : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
      address: typeof address === 'string' ? address : undefined,
      profileImage: typeof profileImage === 'string' ? profileImage : undefined,
    });

    success(res, result, 200, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};
