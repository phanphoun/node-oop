import { randomUUID } from 'node:crypto';
import { AppDataSource } from '../../database/data-source.js';
import { BadRequestError } from '../../core/errors/bad-request.error.js';
import { NotFoundError } from '../../core/errors/not-found.error.js';
import { Category } from './category.entity.js';

export class CategoryService {
  private get categoryRepo() { return AppDataSource.getRepository(Category); }

  async list() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async getById(id: string) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async create(data: { name: string; description?: string | null }) {
    const name = data.name.trim();
    if (!name) {
      throw new BadRequestError('Category name is required');
    }

    const existing = await this.categoryRepo.findOneBy({ name });
    if (existing) {
      throw new BadRequestError('Category already exists');
    }

    const category = this.categoryRepo.create({
      id: randomUUID(),
      name,
      description: data.description || null,
    });

    return this.categoryRepo.save(category);
  }

  async update(id: string, data: { name?: string; description?: string | null }) {
    const category = await this.getById(id);

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) {
        throw new BadRequestError('Category name cannot be empty');
      }
      category.name = name;
    }
    if (data.description !== undefined) {
      category.description = data.description;
    }

    return this.categoryRepo.save(category);
  }

  async delete(id: string) {
    const category = await this.getById(id);
    await this.categoryRepo.remove(category);
  }
}
