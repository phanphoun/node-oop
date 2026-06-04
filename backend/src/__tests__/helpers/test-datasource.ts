import { DataSource } from 'typeorm';
import { Product } from '../../modules/product/product.entity.js';
import { Customer } from '../../modules/customer/customer.entity.js';
import { User } from '../../modules/auth/user.entity.js';

export const testDataSource = new DataSource({
  type: 'sqljs',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [Product, Customer, User],
});
