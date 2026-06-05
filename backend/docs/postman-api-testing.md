# BuyNow API Postman Testing Guide

This guide documents the BuyNow backend API for manual testing with Postman. All API routes are mounted under `/api`, and the default local base URL is:

```text
http://localhost:4000
```

The root health check is:

```http
GET {{baseUrl}}/
```

Expected body:

```text
Welcome to buynow website.
```

## 1. Start The API

From `backend/`:

```bash
npm install
npm run db:migrate:run
npm run dev
```

Make sure `.env` has database settings, `JWT_SECRET`, `PORT=4000`, and optional PayPal credentials.

If `PAYPAL_CLIENT_ID` or `PAYPAL_CLIENT_SECRET` is empty, PayPal payment testing uses a simulated completed PayPal response.

## 2. Create A Postman Environment

Create a Postman environment named `BuyNow Local` with these variables:

| Variable | Initial value |
|---|---|
| `baseUrl` | `http://localhost:4000` |
| `testPassword` | `secret1` |
| `adminEmail` | blank |
| `buyerEmail` | blank |
| `sellerEmail` | blank |
| `adminToken` | blank |
| `buyerToken` | blank |
| `sellerToken` | blank |
| `adminId` | blank |
| `buyerId` | blank |
| `sellerId` | blank |
| `categoryId` | blank |
| `productId` | blank |
| `cartItemId` | blank |
| `favoriteId` | blank |
| `orderId` | blank |
| `paymentId` | blank |
| `notificationId` | blank |
| `productSku` | blank |
| `runId` | blank |

Optional collection-level pre-request script:

```javascript
if (!pm.environment.get('runId')) {
  const runId = String(Date.now());

  pm.environment.set('runId', runId);
  pm.environment.set('testPassword', 'secret1');
  pm.environment.set('adminEmail', `admin.${runId}@example.com`);
  pm.environment.set('buyerEmail', `buyer.${runId}@example.com`);
  pm.environment.set('sellerEmail', `seller.${runId}@example.com`);
  pm.environment.set('productSku', `POSTMAN-${runId}`);
}
```

To start a clean run, clear `runId` and the generated email/SKU variables.

## 3. Common Headers And Auth

For JSON requests:

```http
Content-Type: application/json
```

Protected endpoints require:

```http
Authorization: Bearer {{buyerToken}}
```

Use these tokens by folder:

| Folder | Bearer token |
|---|---|
| Admin | `{{adminToken}}` |
| Seller | `{{sellerToken}}` |
| Buyer | `{{buyerToken}}` |
| Public | no auth |

Supported roles:

| Role | Purpose |
|---|---|
| `Admin` | Admin dashboard, category management, full product/order/payment visibility |
| `BusinessOwner` | Seller product, order, and payment workflows |
| `Buyer` | Cart, favorites, reviews, checkout, and PayPal payment workflows |

Important: the public register endpoint allows `Buyer` and `BusinessOwner`, but it does not allow `Admin`. For local admin testing, create a test user first, then promote it in the local database.

Example local admin setup:

1. Register a user with `{{adminEmail}}`.
2. Run this SQL in your local database:

```sql
UPDATE users
SET role = 'Admin'
WHERE email = 'admin.1234567890@example.com';
```

Use the actual `adminEmail` generated in Postman.

## 4. Response Shapes

Successful JSON responses:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Delete endpoints usually return `204 No Content` with an empty body.

Error responses:

```json
{
  "success": false,
  "message": "Validation or authorization message"
}
```

Common status codes:

| Status | Meaning |
|---|---|
| `200` | Request succeeded |
| `201` | Resource created |
| `204` | Resource deleted or disabled |
| `400` | Invalid request body or query |
| `401` | Missing or invalid bearer token |
| `403` | Valid token but wrong role or ownership |
| `404` | Resource not found |
| `500` | Unexpected server error |

## 5. Recommended Test Flow

Run these requests in order for a full Postman smoke test:

1. `GET /` to verify the server is running.
2. Register admin candidate, promote it to `Admin` in the database, then login and save `adminToken`.
3. Create a seller with admin credentials, then login as the seller and save `sellerToken`.
4. Register/login a buyer and save `buyerToken`.
5. Create a category as admin and save `categoryId`.
6. Create a product as seller or admin and save `productId`.
7. List/search products and get the product by ID.
8. Add product to buyer cart and save `cartItemId`.
9. Checkout as buyer and save `orderId`.
10. Pay with PayPal as buyer and save `paymentId`.
11. Create/read reviews, favorites, and notifications.
12. Test role restrictions by calling an admin route with `buyerToken` and expecting `403`.

## 6. Useful Postman Tests Scripts

Basic success assertion for JSON endpoints:

```javascript
pm.test('response is success', function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
  pm.expect(pm.response.json().success).to.eql(true);
});
```

Save a login/register token:

```javascript
const data = pm.response.json().data;

pm.environment.set('buyerToken', data.token);
pm.environment.set('buyerId', data.user.id);
```

Change `buyerToken` and `buyerId` to `adminToken`/`adminId` or `sellerToken`/`sellerId` when saving those users.

Save an ID from a created resource:

```javascript
pm.environment.set('categoryId', pm.response.json().data.id);
```

Save a product ID from either a create response or list response:

```javascript
const data = pm.response.json().data;
const product = data.id ? data : data.items?.[0];

if (product?.id) {
  pm.environment.set('productId', product.id);
}
```

Save the first cart item ID:

```javascript
const items = pm.response.json().data.items || [];

if (items[0]?.id) {
  pm.environment.set('cartItemId', items[0].id);
}
```

Save an order ID from checkout:

```javascript
pm.environment.set('orderId', pm.response.json().data.id);
```

Save a PayPal payment ID:

```javascript
pm.environment.set('paymentId', pm.response.json().data.payment.id);
```

## 7. Auth Endpoints

Base path: `/api/auth`

| Request | Auth | Expected |
|---|---|---|
| `POST /register` | none | `201` |
| `POST /login` | none | `200` |
| `POST /logout` | any authenticated user | `200` |
| `GET /profile` | any authenticated user | `200` |
| `PUT /profile` | any authenticated user | `200` |

Register buyer:

```http
POST {{baseUrl}}/api/auth/register
```

```json
{
  "name": "Postman Buyer",
  "email": "{{buyerEmail}}",
  "password": "{{testPassword}}",
  "role": "Buyer",
  "phone": "012345678",
  "address": "Phnom Penh"
}
```

Register seller directly:

```json
{
  "name": "Postman Seller",
  "email": "{{sellerEmail}}",
  "password": "{{testPassword}}",
  "role": "BusinessOwner"
}
```

Login:

```http
POST {{baseUrl}}/api/auth/login
```

```json
{
  "email": "{{buyerEmail}}",
  "password": "{{testPassword}}"
}
```

Update profile:

```http
PUT {{baseUrl}}/api/auth/profile
Authorization: Bearer {{buyerToken}}
```

```json
{
  "name": "Updated Buyer",
  "phone": "098765432",
  "address": "Updated address"
}
```

## 8. Admin Endpoints

Base path: `/api/admin`

All admin endpoints require:

```http
Authorization: Bearer {{adminToken}}
```

| Request | Query/body notes | Expected |
|---|---|---|
| `GET /users` | `page`, `limit` | `200` |
| `POST /business-owner` | create seller account | `201` |
| `PUT /business-owner/:id` | update seller account | `200` |
| `DELETE /business-owner/:id` | disables seller account | `204` |
| `GET /products` | `page`, `limit`, product filters | `200` |
| `DELETE /products/:id` | disables product | `204` |
| `GET /orders` | `page`, `limit` | `200` |
| `GET /notifications` | none | `200` |
| `GET /analytics` | none | `200` |

Create business owner:

```http
POST {{baseUrl}}/api/admin/business-owner
```

```json
{
  "name": "Postman Seller",
  "email": "{{sellerEmail}}",
  "password": "{{testPassword}}",
  "phone": "010000000",
  "address": "Seller address"
}
```

Save `data.id` as `sellerId`, then login through `/api/auth/login` using `sellerEmail` to get `sellerToken`.

Update business owner:

```http
PUT {{baseUrl}}/api/admin/business-owner/{{sellerId}}
```

```json
{
  "name": "Updated Seller",
  "phone": "011111111",
  "address": "Updated seller address",
  "status": true
}
```

## 9. Seller Endpoints

Base path: `/api/seller`

All seller endpoints require:

```http
Authorization: Bearer {{sellerToken}}
```

| Request | Query/body notes | Expected |
|---|---|---|
| `GET /products` | `page`, `limit`, product filters | `200` |
| `POST /products` | create product owned by seller | `201` |
| `PUT /products/:id` | update own product | `200` |
| `DELETE /products/:id` | disables own product | `204` |
| `GET /orders` | seller orders only | `200` |
| `GET /payments` | seller payments only | `200` |
| `PUT /profile` | seller profile fields | `200` |

Create seller product:

```http
POST {{baseUrl}}/api/seller/products
```

```json
{
  "name": "Postman Headphones",
  "description": "Wireless headphones created from Postman",
  "price": 49.99,
  "stock": 25,
  "categoryId": "{{categoryId}}",
  "image": "https://example.com/headphones.png",
  "sku": "{{productSku}}"
}
```

Update seller product:

```http
PUT {{baseUrl}}/api/seller/products/{{productId}}
```

```json
{
  "price": 44.99,
  "stock": 20,
  "status": true
}
```

## 10. Category Endpoints

Base path: `/api/categories`

| Request | Auth | Expected |
|---|---|---|
| `GET /` | none | `200` |
| `GET /:id` | none | `200` |
| `POST /` | admin | `201` |
| `PUT /:id` | admin | `200` |
| `DELETE /:id` | admin | `204` |

Create category:

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{adminToken}}
```

```json
{
  "name": "Postman Electronics",
  "description": "Devices and accessories"
}
```

Update category:

```json
{
  "name": "Postman Electronics Updated",
  "description": "Updated category description"
}
```

## 11. Product Endpoints

Base path: `/api/products`

| Request | Auth | Expected |
|---|---|---|
| `GET /` | none | `200` |
| `GET /search?search=phone` | none | `200` |
| `GET /top-rated?limit=10` | none | `200` |
| `GET /category/:category` | none | `200` |
| `GET /:id` | none | `200` |
| `POST /` | admin or seller | `201` |
| `PUT /:id` | admin or owning seller | `200` |
| `DELETE /:id` | admin or owning seller | `204` |

Supported list query parameters:

| Query | Example |
|---|---|
| `page` | `1` |
| `limit` | `20` |
| `search` | `headphones` |
| `category` | category name or category ID |
| `minPrice` | `10` |
| `maxPrice` | `100` |
| `sort` | `price_asc`, `price_desc`, or `name` |
| `sellerId` | seller user ID |

Create product as admin:

```http
POST {{baseUrl}}/api/products
Authorization: Bearer {{adminToken}}
```

```json
{
  "name": "Admin Postman Product",
  "description": "Product created by admin",
  "price": 29.99,
  "stock": 15,
  "categoryId": "{{categoryId}}",
  "sellerId": "{{sellerId}}",
  "image": "https://example.com/product.png",
  "sku": "{{productSku}}"
}
```

Search products:

```http
GET {{baseUrl}}/api/products?search=headphones&minPrice=10&maxPrice=100&sort=price_asc&page=1&limit=10
```

Get top-rated products:

```http
GET {{baseUrl}}/api/products/top-rated?limit=10
```

## 12. Cart Endpoints

Base path: `/api/cart`

All cart endpoints require:

```http
Authorization: Bearer {{buyerToken}}
```

| Request | Body notes | Expected |
|---|---|---|
| `GET /` | none | `200` |
| `POST /` | `productId`, `quantity` | `201` |
| `PUT /:id` | `quantity` | `200` |
| `DELETE /:id` | none | `204` |

Add product to cart:

```http
POST {{baseUrl}}/api/cart
```

```json
{
  "productId": "{{productId}}",
  "quantity": 1
}
```

Update cart item:

```http
PUT {{baseUrl}}/api/cart/{{cartItemId}}
```

```json
{
  "quantity": 2
}
```

Setting `quantity` to `0` removes the cart item.

## 13. Favorite Endpoints

Base path: `/api/favorites`

All favorite endpoints require:

```http
Authorization: Bearer {{buyerToken}}
```

| Request | Body notes | Expected |
|---|---|---|
| `GET /` | none | `200` |
| `POST /` | `productId` | `201` |
| `DELETE /:id` | favorite ID or product ID | `204` |

Add favorite:

```http
POST {{baseUrl}}/api/favorites
```

```json
{
  "productId": "{{productId}}"
}
```

## 14. Review Endpoints

Base path: `/api/reviews`

| Request | Auth | Expected |
|---|---|---|
| `GET /:productId` | none | `200` |
| `POST /` | buyer | `201` |

Create or update review:

```http
POST {{baseUrl}}/api/reviews
Authorization: Bearer {{buyerToken}}
```

```json
{
  "productId": "{{productId}}",
  "rating": 5,
  "comment": "Great product from Postman"
}
```

Rules:

| Field | Rule |
|---|---|
| `rating` | integer from `1` to `5` |
| `productId` | must be an active product |
| buyer/product pair | one review per buyer per product; repeated requests update the existing review |

## 15. Order Endpoints

Base path: `/api/orders`

All order endpoints require authentication.

| Request | Auth | Expected |
|---|---|---|
| `GET /` | admin, seller, or buyer | `200` |
| `GET /:id` | admin, seller for own products, or owning buyer | `200` |
| `PUT /:id/status` | admin or seller | `200` |
| `POST /checkout` | buyer | `201` |

There is also a buyer checkout alias:

```http
POST {{baseUrl}}/api/checkout
Authorization: Bearer {{buyerToken}}
```

Checkout creates an order from the buyer cart and clears the cart. No body is required.

Update order status:

```http
PUT {{baseUrl}}/api/orders/{{orderId}}/status
Authorization: Bearer {{adminToken}}
```

```json
{
  "orderStatus": "confirmed",
  "paymentStatus": "paid"
}
```

Valid `orderStatus` values:

| Value |
|---|
| `pending` |
| `confirmed` |
| `processing` |
| `completed` |
| `cancelled` |

Valid `paymentStatus` values:

| Value |
|---|
| `pending` |
| `paid` |
| `failed` |
| `refunded` |

Sellers can update `orderStatus` only. Sellers cannot update `paymentStatus`.

## 16. Payment Endpoints

Base path: `/api/payments`

All payment endpoints require authentication.

| Request | Auth | Expected |
|---|---|---|
| `GET /` | admin, seller, or buyer | `200` |
| `GET /:id` | admin, seller for own orders, or owning buyer | `200` |
| `POST /paypal` | buyer | `201` |

Pay with PayPal:

```http
POST {{baseUrl}}/api/payments/paypal
Authorization: Bearer {{buyerToken}}
```

```json
{
  "orderId": "{{orderId}}"
}
```

Expected `data` shape:

```json
{
  "payment": {
    "id": "payment-id",
    "orderId": "order-id",
    "buyerId": "buyer-id",
    "amount": 49.99,
    "paymentMethod": "PayPal",
    "paymentStatus": "paid",
    "transactionId": "SIM-1234567890"
  },
  "paypal": {
    "id": "SIM-1234567890",
    "status": "COMPLETED",
    "simulated": true
  }
}
```

## 17. Notification Endpoints

Base path: `/api/notifications`

| Request | Auth | Expected |
|---|---|---|
| `GET /` | any authenticated user | `200` |
| `POST /` | admin | `201` |
| `PUT /:id/read` | any authenticated user that can see notification | `200` |

Create notification:

```http
POST {{baseUrl}}/api/notifications
Authorization: Bearer {{adminToken}}
```

```json
{
  "userId": "{{buyerId}}",
  "type": "admin_alert",
  "title": "Postman Notice",
  "message": "This notification was created from Postman."
}
```

Use `null` or omit `userId` for a global notification.

Mark notification as read:

```http
PUT {{baseUrl}}/api/notifications/{{notificationId}}/read
Authorization: Bearer {{buyerToken}}
```

## 18. Negative Test Cases

Use these to verify auth and validation behavior:

| Case | Request | Expected |
|---|---|---|
| Missing token | `GET /api/cart` | `401` |
| Wrong role | `GET /api/admin/users` with `buyerToken` | `403` |
| Invalid login | `POST /api/auth/login` with wrong password | `401` |
| Invalid product price | `POST /api/products` with negative `price` | `400` |
| Invalid cart quantity | `POST /api/cart` with `quantity: 0` | `400` |
| Invalid review rating | `POST /api/reviews` with `rating: 6` | `400` |
| Missing product | `GET /api/products/not-found` | `404` |

## 19. Endpoint Checklist

Use this checklist when building a complete Postman collection.

| Done | Method | URL |
|---|---|---|
|  | `GET` | `{{baseUrl}}/` |
|  | `POST` | `{{baseUrl}}/api/auth/register` |
|  | `POST` | `{{baseUrl}}/api/auth/login` |
|  | `POST` | `{{baseUrl}}/api/auth/logout` |
|  | `GET` | `{{baseUrl}}/api/auth/profile` |
|  | `PUT` | `{{baseUrl}}/api/auth/profile` |
|  | `GET` | `{{baseUrl}}/api/admin/users` |
|  | `POST` | `{{baseUrl}}/api/admin/business-owner` |
|  | `PUT` | `{{baseUrl}}/api/admin/business-owner/{{sellerId}}` |
|  | `DELETE` | `{{baseUrl}}/api/admin/business-owner/{{sellerId}}` |
|  | `GET` | `{{baseUrl}}/api/admin/products` |
|  | `DELETE` | `{{baseUrl}}/api/admin/products/{{productId}}` |
|  | `GET` | `{{baseUrl}}/api/admin/orders` |
|  | `GET` | `{{baseUrl}}/api/admin/notifications` |
|  | `GET` | `{{baseUrl}}/api/admin/analytics` |
|  | `GET` | `{{baseUrl}}/api/seller/products` |
|  | `POST` | `{{baseUrl}}/api/seller/products` |
|  | `PUT` | `{{baseUrl}}/api/seller/products/{{productId}}` |
|  | `DELETE` | `{{baseUrl}}/api/seller/products/{{productId}}` |
|  | `GET` | `{{baseUrl}}/api/seller/orders` |
|  | `GET` | `{{baseUrl}}/api/seller/payments` |
|  | `PUT` | `{{baseUrl}}/api/seller/profile` |
|  | `GET` | `{{baseUrl}}/api/categories` |
|  | `GET` | `{{baseUrl}}/api/categories/{{categoryId}}` |
|  | `POST` | `{{baseUrl}}/api/categories` |
|  | `PUT` | `{{baseUrl}}/api/categories/{{categoryId}}` |
|  | `DELETE` | `{{baseUrl}}/api/categories/{{categoryId}}` |
|  | `GET` | `{{baseUrl}}/api/products` |
|  | `GET` | `{{baseUrl}}/api/products/search?search=headphones` |
|  | `GET` | `{{baseUrl}}/api/products/top-rated?limit=10` |
|  | `GET` | `{{baseUrl}}/api/products/category/{{categoryId}}` |
|  | `GET` | `{{baseUrl}}/api/products/{{productId}}` |
|  | `POST` | `{{baseUrl}}/api/products` |
|  | `PUT` | `{{baseUrl}}/api/products/{{productId}}` |
|  | `DELETE` | `{{baseUrl}}/api/products/{{productId}}` |
|  | `GET` | `{{baseUrl}}/api/cart` |
|  | `POST` | `{{baseUrl}}/api/cart` |
|  | `PUT` | `{{baseUrl}}/api/cart/{{cartItemId}}` |
|  | `DELETE` | `{{baseUrl}}/api/cart/{{cartItemId}}` |
|  | `GET` | `{{baseUrl}}/api/favorites` |
|  | `POST` | `{{baseUrl}}/api/favorites` |
|  | `DELETE` | `{{baseUrl}}/api/favorites/{{favoriteId}}` |
|  | `GET` | `{{baseUrl}}/api/reviews/{{productId}}` |
|  | `POST` | `{{baseUrl}}/api/reviews` |
|  | `GET` | `{{baseUrl}}/api/orders` |
|  | `GET` | `{{baseUrl}}/api/orders/{{orderId}}` |
|  | `PUT` | `{{baseUrl}}/api/orders/{{orderId}}/status` |
|  | `POST` | `{{baseUrl}}/api/orders/checkout` |
|  | `POST` | `{{baseUrl}}/api/checkout` |
|  | `GET` | `{{baseUrl}}/api/payments` |
|  | `GET` | `{{baseUrl}}/api/payments/{{paymentId}}` |
|  | `POST` | `{{baseUrl}}/api/payments/paypal` |
|  | `GET` | `{{baseUrl}}/api/notifications` |
|  | `POST` | `{{baseUrl}}/api/notifications` |
|  | `PUT` | `{{baseUrl}}/api/notifications/{{notificationId}}/read` |
