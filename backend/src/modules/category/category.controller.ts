import type { NextFunction, Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { noContent, success } from '../../core/utils/response.util.js';

const categoryService = new CategoryService();

export const listCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await categoryService.list());
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    success(res, await categoryService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as Record<string, unknown>;
    success(
      res,
      await categoryService.create({
        name: typeof name === 'string' ? name : '',
        description: typeof description === 'string' ? description : null,
      }),
      201,
      'Category created successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body as Record<string, unknown>;
    success(
      res,
      await categoryService.update(req.params.id, {
        name: typeof name === 'string' ? name : undefined,
        description: typeof description === 'string' ? description : undefined,
      }),
      200,
      'Category updated successfully',
    );
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.delete(req.params.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
};
