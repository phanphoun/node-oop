import { AppDataSource } from "../../database/data-source.ts";
import { Product } from "./product.entity.ts";

export const productRepository =
  AppDataSource.getRepository(Product);