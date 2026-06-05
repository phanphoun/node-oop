import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.config.js';
import { UserRole } from '../src/constants/roles.enum.js';
import { AdminService } from '../src/modules/admin/admin.service.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { CartService } from '../src/modules/cart/cart.service.js';
import { CategoryService } from '../src/modules/category/category.service.js';
import { FavoriteService } from '../src/modules/favorite/favorite.service.js';
import { NotificationService } from '../src/modules/notification/notification.service.js';
import { OrderService } from '../src/modules/order/order.service.js';
import { PaymentService } from '../src/modules/payment/payment.service.js';
import { ProductService } from '../src/modules/product/product.service.js';
import { ReviewService } from '../src/modules/review/review.service.js';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type TestToken = 'admin' | 'seller' | 'buyer';

type EndpointCase = {
  name: string;
  method: HttpMethod;
  path: string;
  body?: unknown;
  token?: TestToken;
  expectedStatus: number;
};

const now = new Date('2026-01-01T00:00:00.000Z');

const user = (id: string, role: UserRole) => ({
  id,
  name: `${role} User`,
  email: `${role.toLowerCase()}@example.com`,
  role,
  phone: null,
  address: null,
  status: true,
  createdAt: now,
  updatedAt: now,
});

const category = {
  id: 'category-1',
  name: 'Electronics',
  description: 'Devices and accessories',
  createdAt: now,
  updatedAt: now,
};

const product = {
  id: 'product-1',
  name: 'Demo Product',
  description: 'A product fixture',
  price: 25,
  stock: 10,
  categoryId: category.id,
  sellerId: 'seller-1',
  image: null,
  sku: 'DEMO-1',
  status: true,
  category,
  createdAt: now,
  updatedAt: now,
};

const paged = (items: unknown[]) => ({
  items,
  meta: {
    page: 1,
    limit: 10,
    total: items.length,
  },
});

const order = {
  id: 'order-1',
  buyerId: 'buyer-1',
  totalAmount: 25,
  paymentStatus: 'pending',
  orderStatus: 'pending',
  items: [
    {
      id: 'order-item-1',
      orderId: 'order-1',
      productId: product.id,
      quantity: 1,
      price: product.price,
      product,
    },
  ],
  createdAt: now,
  updatedAt: now,
};

const payment = {
  id: 'payment-1',
  orderId: order.id,
  buyerId: 'buyer-1',
  amount: order.totalAmount,
  paymentMethod: 'PayPal',
  paymentStatus: 'paid',
  transactionId: 'paypal-1',
  order,
  createdAt: now,
  updatedAt: now,
};

const notification = {
  id: 'notification-1',
  userId: 'buyer-1',
  type: 'admin_alert',
  title: 'Notice',
  message: 'Fixture notification',
  isRead: false,
  createdAt: now,
  updatedAt: now,
};

const cart = {
  id: 'cart-1',
  buyerId: 'buyer-1',
  items: [
    {
      id: 'cart-item-1',
      cartId: 'cart-1',
      productId: product.id,
      quantity: 1,
      product,
    },
  ],
};

const reviewSummary = {
  items: [
    {
      id: 'review-1',
      buyerId: 'buyer-1',
      productId: product.id,
      rating: 5,
      comment: 'Great',
      createdAt: now,
      updatedAt: now,
    },
  ],
  meta: {
    count: 1,
    averageRating: 5,
  },
};

const patch = (
  prototype: object,
  method: string,
  replacement: unknown,
) => {
  Object.defineProperty(prototype, method, {
    configurable: true,
    value: replacement,
  });
};

patch(AuthService.prototype, 'register', async () => ({
  user: user('buyer-1', UserRole.Buyer),
  token: 'registered-token',
}));
patch(AuthService.prototype, 'login', async () => ({
  user: user('buyer-1', UserRole.Buyer),
  token: 'login-token',
}));
patch(AuthService.prototype, 'getProfile', async () => user('buyer-1', UserRole.Buyer));
patch(AuthService.prototype, 'updateProfile', async () => user('buyer-1', UserRole.Buyer));

patch(AdminService.prototype, 'listUsers', async () => paged([
  user('admin-1', UserRole.Admin),
  user('buyer-1', UserRole.Buyer),
]));
patch(AdminService.prototype, 'createBusinessOwner', async () => user('seller-1', UserRole.BusinessOwner));
patch(AdminService.prototype, 'updateBusinessOwner', async () => user('seller-1', UserRole.BusinessOwner));
patch(AdminService.prototype, 'removeBusinessOwner', async () => undefined);
patch(AdminService.prototype, 'analytics', async () => ({
  users: 3,
  sellers: 1,
  buyers: 1,
  products: 1,
  orders: 1,
  payments: 1,
  revenue: 25,
}));

patch(CategoryService.prototype, 'list', async () => [category]);
patch(CategoryService.prototype, 'getById', async () => category);
patch(CategoryService.prototype, 'create', async () => category);
patch(CategoryService.prototype, 'update', async () => category);
patch(CategoryService.prototype, 'delete', async () => undefined);

patch(ProductService.prototype, 'list', async () => paged([product]));
patch(ProductService.prototype, 'listBySeller', async () => paged([product]));
patch(ProductService.prototype, 'topRated', async () => [product]);
patch(ProductService.prototype, 'getById', async () => product);
patch(ProductService.prototype, 'create', async () => product);
patch(ProductService.prototype, 'update', async () => product);
patch(ProductService.prototype, 'delete', async () => undefined);

patch(CartService.prototype, 'getCart', async () => cart);
patch(CartService.prototype, 'addItem', async () => cart);
patch(CartService.prototype, 'updateItem', async () => cart);
patch(CartService.prototype, 'removeItem', async () => undefined);

patch(FavoriteService.prototype, 'list', async () => [{ id: 'favorite-1', buyerId: 'buyer-1', productId: product.id, product }]);
patch(FavoriteService.prototype, 'add', async () => ({ id: 'favorite-1', buyerId: 'buyer-1', productId: product.id }));
patch(FavoriteService.prototype, 'remove', async () => undefined);

patch(ReviewService.prototype, 'listByProduct', async () => reviewSummary);
patch(ReviewService.prototype, 'create', async () => reviewSummary.items[0]);

patch(OrderService.prototype, 'checkout', async () => order);
patch(OrderService.prototype, 'listAll', async () => paged([order]));
patch(OrderService.prototype, 'listForSeller', async () => paged([order]));
patch(OrderService.prototype, 'listForBuyer', async () => paged([order]));
patch(OrderService.prototype, 'getById', async () => order);
patch(OrderService.prototype, 'updateStatus', async () => ({ ...order, orderStatus: 'confirmed' }));
patch(OrderService.prototype, 'sellerOwnsOrder', async () => true);

patch(PaymentService.prototype, 'payWithPayPal', async () => ({
  payment,
  paypal: {
    id: 'paypal-1',
    status: 'COMPLETED',
    simulated: true,
  },
}));
patch(PaymentService.prototype, 'listAll', async () => paged([payment]));
patch(PaymentService.prototype, 'listForSeller', async () => paged([payment]));
patch(PaymentService.prototype, 'listForBuyer', async () => paged([payment]));
patch(PaymentService.prototype, 'getById', async () => payment);

patch(NotificationService.prototype, 'listForUser', async () => [notification]);
patch(NotificationService.prototype, 'listAll', async () => [notification]);
patch(NotificationService.prototype, 'create', async () => notification);
patch(NotificationService.prototype, 'markRead', async () => ({ ...notification, isRead: true }));

const { default: app } = await import('../src/app.js');

let server: http.Server;
let baseUrl: string;

const tokens: Record<TestToken, string> = {
  admin: jwt.sign({ sub: 'admin-1', role: UserRole.Admin }, env.jwtSecret),
  seller: jwt.sign({ sub: 'seller-1', role: UserRole.BusinessOwner }, env.jwtSecret),
  buyer: jwt.sign({ sub: 'buyer-1', role: UserRole.Buyer }, env.jwtSecret),
};

const request = async (testCase: EndpointCase) => {
  const headers: Record<string, string> = {};

  if (testCase.token) {
    headers.Authorization = `Bearer ${tokens[testCase.token]}`;
  }

  let body: string | undefined;
  if (testCase.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(testCase.body);
  }

  const response = await fetch(`${baseUrl}${testCase.path}`, {
    method: testCase.method,
    headers,
    body,
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';

  return {
    response,
    body: text && contentType.includes('application/json') ? JSON.parse(text) as unknown : text || null,
  };
};

const endpointCases: EndpointCase[] = [
  { name: 'GET /', method: 'GET', path: '/', expectedStatus: 200 },

  { name: 'POST /api/auth/register', method: 'POST', path: '/api/auth/register', expectedStatus: 201, body: { name: 'Buyer User', email: 'buyer@example.com', password: 'secret1' } },
  { name: 'POST /api/auth/login', method: 'POST', path: '/api/auth/login', expectedStatus: 200, body: { email: 'buyer@example.com', password: 'secret1' } },
  { name: 'POST /api/auth/logout', method: 'POST', path: '/api/auth/logout', expectedStatus: 200, token: 'buyer' },
  { name: 'GET /api/auth/profile', method: 'GET', path: '/api/auth/profile', expectedStatus: 200, token: 'buyer' },
  { name: 'PUT /api/auth/profile', method: 'PUT', path: '/api/auth/profile', expectedStatus: 200, token: 'buyer', body: { name: 'Updated Buyer' } },

  { name: 'GET /api/admin/users', method: 'GET', path: '/api/admin/users', expectedStatus: 200, token: 'admin' },
  { name: 'POST /api/admin/business-owner', method: 'POST', path: '/api/admin/business-owner', expectedStatus: 201, token: 'admin', body: { name: 'Seller User', email: 'seller@example.com', password: 'secret1' } },
  { name: 'PUT /api/admin/business-owner/:id', method: 'PUT', path: '/api/admin/business-owner/seller-1', expectedStatus: 200, token: 'admin', body: { name: 'Updated Seller' } },
  { name: 'DELETE /api/admin/business-owner/:id', method: 'DELETE', path: '/api/admin/business-owner/seller-1', expectedStatus: 204, token: 'admin' },
  { name: 'GET /api/admin/products', method: 'GET', path: '/api/admin/products', expectedStatus: 200, token: 'admin' },
  { name: 'DELETE /api/admin/products/:id', method: 'DELETE', path: '/api/admin/products/product-1', expectedStatus: 204, token: 'admin' },
  { name: 'GET /api/admin/orders', method: 'GET', path: '/api/admin/orders', expectedStatus: 200, token: 'admin' },
  { name: 'GET /api/admin/notifications', method: 'GET', path: '/api/admin/notifications', expectedStatus: 200, token: 'admin' },
  { name: 'GET /api/admin/analytics', method: 'GET', path: '/api/admin/analytics', expectedStatus: 200, token: 'admin' },

  { name: 'GET /api/seller/products', method: 'GET', path: '/api/seller/products', expectedStatus: 200, token: 'seller' },
  { name: 'POST /api/seller/products', method: 'POST', path: '/api/seller/products', expectedStatus: 201, token: 'seller', body: { name: 'Seller Product', price: 25, stock: 10 } },
  { name: 'PUT /api/seller/products/:id', method: 'PUT', path: '/api/seller/products/product-1', expectedStatus: 200, token: 'seller', body: { stock: 9 } },
  { name: 'DELETE /api/seller/products/:id', method: 'DELETE', path: '/api/seller/products/product-1', expectedStatus: 204, token: 'seller' },
  { name: 'GET /api/seller/orders', method: 'GET', path: '/api/seller/orders', expectedStatus: 200, token: 'seller' },
  { name: 'GET /api/seller/payments', method: 'GET', path: '/api/seller/payments', expectedStatus: 200, token: 'seller' },
  { name: 'PUT /api/seller/profile', method: 'PUT', path: '/api/seller/profile', expectedStatus: 200, token: 'seller', body: { name: 'Updated Seller' } },

  { name: 'GET /api/categories', method: 'GET', path: '/api/categories', expectedStatus: 200 },
  { name: 'GET /api/categories/:id', method: 'GET', path: '/api/categories/category-1', expectedStatus: 200 },
  { name: 'POST /api/categories', method: 'POST', path: '/api/categories', expectedStatus: 201, token: 'admin', body: { name: 'Electronics' } },
  { name: 'PUT /api/categories/:id', method: 'PUT', path: '/api/categories/category-1', expectedStatus: 200, token: 'admin', body: { description: 'Updated' } },
  { name: 'DELETE /api/categories/:id', method: 'DELETE', path: '/api/categories/category-1', expectedStatus: 204, token: 'admin' },

  { name: 'GET /api/products', method: 'GET', path: '/api/products', expectedStatus: 200 },
  { name: 'GET /api/products/search', method: 'GET', path: '/api/products/search?search=demo', expectedStatus: 200 },
  { name: 'GET /api/products/top-rated', method: 'GET', path: '/api/products/top-rated', expectedStatus: 200 },
  { name: 'GET /api/products/category/:category', method: 'GET', path: '/api/products/category/Electronics', expectedStatus: 200 },
  { name: 'GET /api/products/:id', method: 'GET', path: '/api/products/product-1', expectedStatus: 200 },
  { name: 'POST /api/products', method: 'POST', path: '/api/products', expectedStatus: 201, token: 'admin', body: { name: 'New Product', price: 25, stock: 10, sellerId: 'seller-1' } },
  { name: 'PUT /api/products/:id', method: 'PUT', path: '/api/products/product-1', expectedStatus: 200, token: 'admin', body: { stock: 8 } },
  { name: 'DELETE /api/products/:id', method: 'DELETE', path: '/api/products/product-1', expectedStatus: 204, token: 'admin' },

  { name: 'GET /api/cart', method: 'GET', path: '/api/cart', expectedStatus: 200, token: 'buyer' },
  { name: 'POST /api/cart', method: 'POST', path: '/api/cart', expectedStatus: 201, token: 'buyer', body: { productId: 'product-1', quantity: 1 } },
  { name: 'PUT /api/cart/:id', method: 'PUT', path: '/api/cart/cart-item-1', expectedStatus: 200, token: 'buyer', body: { quantity: 2 } },
  { name: 'DELETE /api/cart/:id', method: 'DELETE', path: '/api/cart/cart-item-1', expectedStatus: 204, token: 'buyer' },

  { name: 'GET /api/favorites', method: 'GET', path: '/api/favorites', expectedStatus: 200, token: 'buyer' },
  { name: 'POST /api/favorites', method: 'POST', path: '/api/favorites', expectedStatus: 201, token: 'buyer', body: { productId: 'product-1' } },
  { name: 'DELETE /api/favorites/:id', method: 'DELETE', path: '/api/favorites/favorite-1', expectedStatus: 204, token: 'buyer' },

  { name: 'GET /api/reviews/:productId', method: 'GET', path: '/api/reviews/product-1', expectedStatus: 200 },
  { name: 'POST /api/reviews', method: 'POST', path: '/api/reviews', expectedStatus: 201, token: 'buyer', body: { productId: 'product-1', rating: 5, comment: 'Great' } },

  { name: 'GET /api/orders', method: 'GET', path: '/api/orders', expectedStatus: 200, token: 'buyer' },
  { name: 'GET /api/orders/:id', method: 'GET', path: '/api/orders/order-1', expectedStatus: 200, token: 'buyer' },
  { name: 'PUT /api/orders/:id/status', method: 'PUT', path: '/api/orders/order-1/status', expectedStatus: 200, token: 'admin', body: { orderStatus: 'confirmed' } },
  { name: 'POST /api/orders/checkout', method: 'POST', path: '/api/orders/checkout', expectedStatus: 201, token: 'buyer' },

  { name: 'GET /api/payments', method: 'GET', path: '/api/payments', expectedStatus: 200, token: 'buyer' },
  { name: 'GET /api/payments/:id', method: 'GET', path: '/api/payments/payment-1', expectedStatus: 200, token: 'buyer' },
  { name: 'POST /api/payments/paypal', method: 'POST', path: '/api/payments/paypal', expectedStatus: 201, token: 'buyer', body: { orderId: 'order-1' } },

  { name: 'GET /api/notifications', method: 'GET', path: '/api/notifications', expectedStatus: 200, token: 'buyer' },
  { name: 'POST /api/notifications', method: 'POST', path: '/api/notifications', expectedStatus: 201, token: 'admin', body: { title: 'Notice', message: 'Hello' } },
  { name: 'PUT /api/notifications/:id/read', method: 'PUT', path: '/api/notifications/notification-1/read', expectedStatus: 200, token: 'buyer' },

  { name: 'POST /api/checkout', method: 'POST', path: '/api/checkout', expectedStatus: 201, token: 'buyer' },
];

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));

  const address = server.address();
  assert(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

describe('API endpoint smoke tests', () => {
  for (const testCase of endpointCases) {
    it(testCase.name, async () => {
      const { response, body } = await request(testCase);

      assert.equal(response.status, testCase.expectedStatus);

      if (testCase.expectedStatus === 204) {
        assert.equal(body, null);
        return;
      }

      if (testCase.path === '/') {
        assert.equal(body, 'Welcome to buynow website.');
        return;
      }

      assert.equal((body as { success?: boolean }).success, true);
    });
  }
});
