import type { NextFunction, Request, Response } from 'express';
import { ReviewService } from './review.service.js';
import type { AuthRequest } from '../../shared/interfaces/request.interface.js';
import { success } from '../../core/utils/response.util.js';

const reviewService = new ReviewService();

export const listProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await reviewService.listByProduct(req.params.productId));
  } catch (err) {
    next(err);
  }
};

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, comment } = req.body as Record<string, unknown>;
    success(
      res,
      await reviewService.create(req.user!.id, {
        productId: typeof productId === 'string' ? productId : '',
        rating: Number(rating),
        comment: typeof comment === 'string' ? comment : null,
      }),
      201,
      'Review saved successfully',
    );
  } catch (err) {
    next(err);
  }
};
