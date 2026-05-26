import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

const __dirname = import.meta.dirname;

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'buy_now',
  synchronize: false,
  logging: false,
  entities: [path.join(__dirname, '../modules/**/*.entity.' + (isProduction ? 'js' : 'ts'))],
  migrations: [path.join(__dirname, 'migrations/*.' + (isProduction ? 'js' : 'ts'))],
  subscribers: [],
});
