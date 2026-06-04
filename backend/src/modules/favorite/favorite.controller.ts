import type { NextFunction, Response } from 'express';
import { FavoriteService } from './favorite.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { noContent, success } from '../../core/utils/response.util.js';

const favoriteService = new FavoriteService();

export const listFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    success(res, await favoriteService.list(req.user!.id));
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body as Record<string, unknown>;
    success(
      res,
      await favoriteService.add(req.user!.id, typeof productId === 'string' ? productId : ''),
      201,
      'Product added to favorites',
    );
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await favoriteService.remove(req.user!.id, req.params.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
};
