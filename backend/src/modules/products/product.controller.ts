import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductService } from './product.service.ts';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './product.dto.ts';
import { HttpStatus } from '../../constants/http-status.constant.ts';
import { Messages } from '../../constants/messages.constant.ts';
import { BadRequestError } from '../../core/errors/bad-request.error.ts';

const productService = new ProductService();

async function validateDto(dto: object, dtoClass: new () => object) {
  const instance = plainToInstance(dtoClass, dto);
  const errors = await validate(instance as object);
  if (errors.length > 0) {
    const messages = errors.map((e) => Object.values(e.constraints || {})).flat();
    throw new BadRequestError(messages.join('; '));
  }
  return instance;
}

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = await validateDto(req.query, ProductQueryDto) as ProductQueryDto;
      const result = await productService.findAll(query);
      res.json({ success: true, message: Messages.PRODUCTS_FETCHED, ...result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findById(req.params.id);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateDto(req.body, CreateProductDto) as CreateProductDto;
      const product = await productService.create(data);
      res.status(HttpStatus.CREATED).json({ success: true, message: Messages.PRODUCT_CREATED, data: product });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await validateDto(req.body, UpdateProductDto) as UpdateProductDto;
      const product = await productService.update(req.params.id, data);
      res.json({ success: true, message: Messages.PRODUCT_UPDATED, data: product });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id);
      res.json({ success: true, message: Messages.PRODUCT_DELETED });
    } catch (err) {
      next(err);
    }
  }
}
