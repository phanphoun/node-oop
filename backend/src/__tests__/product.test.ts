import 'reflect-metadata';
import { testDataSource } from './helpers/test-datasource';
import type { Express } from 'express';
import type supertest from 'supertest';

(jest as any).unstable_mockModule('../database/data-source.js', () => ({
  AppDataSource: testDataSource,
}));

let app: Express;
let request: supertest.SuperTest<supertest.Test>;

beforeAll(async () => {
  const appModule = await import('../app.js');
  const supertestModule = await import('supertest');
  app = appModule.default;
  request = supertestModule.default(app);

  await testDataSource.initialize();
});

afterAll(async () => {
  await testDataSource.destroy();
});

describe('Product API', () => {
  let createdProductId: string;

  it('GET /api/products - should return empty list', async () => {
    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('POST /api/products - should create a product', async () => {
    const res = await request.post('/api/products').send({
      name: 'Test Product',
      description: 'A test product description',
      price: 19.99,
      sku: 'TST-001',
      stock: 10,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Test Product');
    expect(res.body.data.price).toBe(19.99);
    expect(res.body.data.sku).toBe('TST-001');
    expect(res.body.data.stock).toBe(10);
    expect(res.body.data.status).toBe(true);
    expect(res.body.data.id).toBeDefined();
    createdProductId = res.body.data.id;
  });

  it('POST /api/products - should reject duplicate SKU', async () => {
    const res = await request.post('/api/products').send({
      name: 'Another Product',
      price: 9.99,
      sku: 'TST-001',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('SKU already exists');
  });

  it('POST /api/products - should reject missing name', async () => {
    const res = await request.post('/api/products').send({
      price: 9.99,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/products - should reject negative price', async () => {
    const res = await request.post('/api/products').send({
      name: 'Cheap Product',
      price: -5,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/products - should reject invalid stock', async () => {
    const res = await request.post('/api/products').send({
      name: 'Stocked Product',
      price: 10,
      stock: -1,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/products - should return created products', async () => {
    const res = await request.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Test Product');
  });

  it('GET /api/products/:id - should return a product by id', async () => {
    const res = await request.get(`/api/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdProductId);
  });

  it('GET /api/products/:id - should return 404 for non-existent id', async () => {
    const res = await request.get('/api/products/non-existent-id');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('PUT /api/products/:id - should update a product', async () => {
    const res = await request
      .put(`/api/products/${createdProductId}`)
      .send({ name: 'Updated Product', price: 29.99 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Product');
    expect(res.body.data.price).toBe(29.99);
  });

  it('PUT /api/products/:id - should reject invalid update data', async () => {
    const res = await request
      .put(`/api/products/${createdProductId}`)
      .send({ name: 'A' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/products/:id - should delete a product', async () => {
    const res = await request.delete(`/api/products/${createdProductId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/products/:id - should return 404 for deleted product', async () => {
    const res = await request.delete(`/api/products/${createdProductId}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
