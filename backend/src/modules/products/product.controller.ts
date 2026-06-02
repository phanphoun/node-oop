import { Request, Response } from "express";
import { ProductService } from "./product.service.ts";

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response) {
    const products = await productService.getAll();

    res.json(products);
  }

  async getById(req: Request, res: Response) {
    const product = await productService.getById(
      Number(req.params.id)
    );

    res.json(product);
  }

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);

    res.status(201).json(product);
  }

  async update(req: Request, res: Response) {
    const product = await productService.update(
      Number(req.params.id),
      req.body
    );

    res.json(product);
  }

  async delete(req: Request, res: Response) {
    await productService.delete(Number(req.params.id));

    res.json({
      message: "Deleted successfully",
    });
  }
}