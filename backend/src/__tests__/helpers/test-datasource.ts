import { DataSource } from 'typeorm';
import { Product } from '../../modules/product/product.entity.js';
import { Customer } from '../../modules/customer/customer.entity.js';

export const testDataSource = new DataSource({
  type: 'sqljs',
  synchronize: true,
  logging: false,
  entities: [Product, Customer],
});
