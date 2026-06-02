import { productRepository } from "./product.repository.ts";
import { CreateProductDto, UpdateProductDto } from "./product.dto.ts";

export class ProductService {
  async getAll() {
    return await productRepository.find();
  }

  async getById(id: number) {
    return await productRepository.findOneBy({ id });
  }

  async create(data: CreateProductDto) {
    const product = productRepository.create(data);

    return await productRepository.save(product);
  }

  async update(id: number, data: UpdateProductDto) {
    await productRepository.update(id, data);
    return await productRepository.findOneBy({ id });
  }

  async delete(id: number) {
    return await productRepository.delete(id);
  }
}