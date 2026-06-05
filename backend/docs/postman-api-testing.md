# BuyNow API Direct Postman Testing Runbook

This document is for testing the existing BuyNow backend API directly in Postman. You are not creating a new API. You are sending HTTP requests to the backend that already exists in this project.

Default local server:

```text
http://localhost:4000
```

All backend API routes start with:

```text
/api
```

Example:

```http
GET http://localhost:4000/api/products
```

You can use the Postman variables shown in this guide, or you can replace every variable manually with real values from your database and response bodies.

## 1. Before Testing

Start the backend from the `backend/` folder:

```bash
npm install
npm run db:migrate:run
npm run dev
```

The API uses the `PORT` from `backend/.env`. If your `.env` has `PORT=4000`, use:

```text
http://localhost:4000
```

Quick server check:

```http
GET http://localhost:4000/
```

Expected response:

```text
Welcome to buynow website.
```

## 2. Postman Setup

You can test with plain URLs, but using an environment makes the test run much easier.

Create a Postman environment named:

```text
BuyNow Local
```

Add these variables:

| Variable | Value |
|---|---|
| `baseUrl` | `http://localhost:4000` |
| `testPassword` | `secret1` |
| `adminEmail` | `admin.postman@example.com` |
| `buyerEmail` | `buyer.postman@example.com` |
| `sellerEmail` | `seller.postman@example.com` |
| `adminToken` | empty |
| `buyerToken` | empty |
| `sellerToken` | empty |
| `adminId` | empty |
| `buyerId` | empty |
| `sellerId` | empty |
| `categoryId` | empty |
| `productId` | empty |
| `cartItemId` | empty |
| `favoriteId` | empty |
| `orderId` | empty |
| `paymentId` | empty |
| `notificationId` | empty |
| `productSku` | `POSTMAN-001` |

If you get duplicate email or duplicate SKU errors, change the email values and `productSku` to new unique values.

For example:

```text
buyer.20260605@example.com
seller.20260605@example.com
POSTMAN-20260605-001
```

## 3. Postman Request Rules

For requests with a JSON body:

1. Open `Body`.
2. Select `raw`.
3. Select `JSON`.
4. Paste the JSON body from this guide.

For protected routes:

1. Open `Authorization`.
2. Type: `Bearer Token`.
3. Token: use the correct token variable, such as `{{buyerToken}}`.

You can also add this header manually:

```http
Authorization: Bearer {{buyerToken}}
```

Use these tokens:

| User type | Token |
|---|---|
| Admin | `{{adminToken}}` |
| Seller / BusinessOwner | `{{sellerToken}}` |
| Buyer | `{{buyerToken}}` |

## 4. Response Format

Most successful responses look like this:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

Create requests usually return:

```text
201 Created
```

Read and update requests usually return:

```text
200 OK
```

Delete requests usually return:

```text
204 No Content
```

Errors look like this:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common errors:

| Status | Meaning |
|---|---|
| `400` | Bad body, invalid value, duplicate email/SKU, empty cart, invalid quantity |
| `401` | No token or invalid token |
| `403` | Correct token but wrong role or wrong owner |
| `404` | Resource not found |
| `500` | Server/database/unexpected error |

## 5. Very Important Role Notes

The API has three roles:

| Role | String value |
|---|---|
| Admin | `Admin` |
| Seller | `BusinessOwner` |
| Buyer | `Buyer` |

The public register API can create:

| Can register directly? | Role |
|---|---|
| yes | `Buyer` |
| yes | `BusinessOwner` |
| no | `Admin` |

Because public registration does not allow `Admin`, you need one admin account before testing admin routes.

Use one of these options:

| Option | What to do |
|---|---|
| Existing admin | Login with an admin user already in your database |
| Local database update | Register a normal user, then update its role to `Admin` in MySQL |

Example SQL after registering an admin test user:

```sql
UPDATE users
SET role = 'Admin'
WHERE email = 'admin.postman@example.com';
```

Then login again with that email. The new token will contain the `Admin` role.

## 6. Full Direct Testing Order

Use this order when testing from an empty or fresh database:

1. Test server root.
2. Register admin candidate.
3. Promote admin candidate to `Admin` in database.
4. Login admin and save `adminToken`.
5. Create seller with admin endpoint and save `sellerId`.
6. Login seller and save `sellerToken`.
7. Register buyer and save `buyerToken`.
8. Create category and save `categoryId`.
9. Create product and save `productId`.
10. Add product to buyer cart and save `cartItemId`.
11. Checkout and save `orderId`.
12. Pay with PayPal and save `paymentId`.
13. Test favorites, reviews, notifications, orders, payments, admin lists, and seller lists.

This order matters because many routes need IDs created by previous routes.

## 7. How To Save Values Manually

After you send a request, copy IDs/tokens from the response body into Postman environment variables.

Example login response:

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "buyer-user-id",
      "role": "Buyer"
    },
    "token": "jwt-token-here"
  }
}
```

Save:

| Response field | Save as |
|---|---|
| `data.user.id` | `buyerId` |
| `data.token` | `buyerToken` |

Example product create response:

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "product-id-here"
  }
}
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `productId` |

## 8. Optional Postman Test Scripts

You do not need scripts. You can copy values manually. Scripts only make testing faster.

Save buyer token after buyer register/login:

```javascript
const data = pm.response.json().data;
pm.environment.set('buyerId', data.user.id);
pm.environment.set('buyerToken', data.token);
```

Save admin token:

```javascript
const data = pm.response.json().data;
pm.environment.set('adminId', data.user.id);
pm.environment.set('adminToken', data.token);
```

Save seller token:

```javascript
const data = pm.response.json().data;
pm.environment.set('sellerId', data.user.id);
pm.environment.set('sellerToken', data.token);
```

Save created resource ID:

```javascript
pm.environment.set('categoryId', pm.response.json().data.id);
```

Change `categoryId` to `productId`, `favoriteId`, `orderId`, or `notificationId` depending on the request.

Save first cart item ID:

```javascript
const items = pm.response.json().data.items || [];
pm.environment.set('cartItemId', items[0].id);
```

Save PayPal payment ID:

```javascript
pm.environment.set('paymentId', pm.response.json().data.payment.id);
```

## 9. Auth Testing

Base path:

```text
{{baseUrl}}/api/auth
```

### 9.1 Register Admin Candidate

This creates a normal user first. After this request, update the database role to `Admin`, then login.

```http
POST {{baseUrl}}/api/auth/register
```

Auth:

```text
No Auth
```

Body:

```json
{
  "name": "Postman Admin",
  "email": "{{adminEmail}}",
  "password": "{{testPassword}}",
  "role": "Buyer",
  "phone": "010000001",
  "address": "Admin test address"
}
```

Expected:

```text
201 Created
```

Expected response data:

| Field | Notes |
|---|---|
| `data.user.id` | admin candidate user ID |
| `data.user.role` | currently `Buyer` |
| `data.token` | not admin yet, do not use for admin routes |

Now promote this user in MySQL:

```sql
UPDATE users
SET role = 'Admin'
WHERE email = 'admin.postman@example.com';
```

If you used a different `adminEmail`, use that email in the SQL.

### 9.2 Login Admin

```http
POST {{baseUrl}}/api/auth/login
```

Auth:

```text
No Auth
```

Body:

```json
{
  "email": "{{adminEmail}}",
  "password": "{{testPassword}}"
}
```

Expected:

```text
200 OK
```

Save:

| Response field | Save as |
|---|---|
| `data.user.id` | `adminId` |
| `data.token` | `adminToken` |

Confirm:

```text
data.user.role should be Admin
```

### 9.3 Register Buyer

```http
POST {{baseUrl}}/api/auth/register
```

Auth:

```text
No Auth
```

Body:

```json
{
  "name": "Postman Buyer",
  "email": "{{buyerEmail}}",
  "password": "{{testPassword}}",
  "role": "Buyer",
  "phone": "010000002",
  "address": "Buyer test address"
}
```

Expected:

```text
201 Created
```

Save:

| Response field | Save as |
|---|---|
| `data.user.id` | `buyerId` |
| `data.token` | `buyerToken` |

### 9.4 Login Buyer

Use this if you already registered the buyer or need a fresh token.

```http
POST {{baseUrl}}/api/auth/login
```

Auth:

```text
No Auth
```

Body:

```json
{
  "email": "{{buyerEmail}}",
  "password": "{{testPassword}}"
}
```

Expected:

```text
200 OK
```

Save `data.token` as `buyerToken`.

### 9.5 Register Seller Directly

You can create a seller directly with public registration. You can also create a seller through the admin endpoint later.

Use only one seller creation method with the same `sellerEmail`:

| If you want to test | Do this |
|---|---|
| Public seller registration | Run this section |
| Admin-created business owner | Skip this section and use section 10.2 |

For a full admin test, skip this section and create the seller through the admin endpoint.

```http
POST {{baseUrl}}/api/auth/register
```

Auth:

```text
No Auth
```

Body:

```json
{
  "name": "Postman Seller Direct",
  "email": "{{sellerEmail}}",
  "password": "{{testPassword}}",
  "role": "BusinessOwner",
  "phone": "010000003",
  "address": "Seller test address"
}
```

Expected:

```text
201 Created
```

Save:

| Response field | Save as |
|---|---|
| `data.user.id` | `sellerId` |
| `data.token` | `sellerToken` |

### 9.6 Login Seller

```http
POST {{baseUrl}}/api/auth/login
```

Auth:

```text
No Auth
```

Body:

```json
{
  "email": "{{sellerEmail}}",
  "password": "{{testPassword}}"
}
```

Expected:

```text
200 OK
```

Save:

| Response field | Save as |
|---|---|
| `data.user.id` | `sellerId` |
| `data.token` | `sellerToken` |

### 9.7 Get Current Profile

```http
GET {{baseUrl}}/api/auth/profile
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Expected data:

| Field | Notes |
|---|---|
| `data.id` | current user ID |
| `data.email` | current user email |
| `data.role` | `Buyer`, `BusinessOwner`, or `Admin` |

### 9.8 Update Current Profile

```http
PUT {{baseUrl}}/api/auth/profile
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "name": "Postman Buyer Updated",
  "phone": "099999999",
  "address": "Updated buyer address"
}
```

Expected:

```text
200 OK
```

Expected message:

```text
Profile updated successfully
```

### 9.9 Logout

```http
POST {{baseUrl}}/api/auth/logout
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```text
No body
```

Expected:

```text
200 OK
```

Note: this API does not blacklist JWT tokens. Logout only returns a success response.

## 10. Admin Testing

Base path:

```text
{{baseUrl}}/api/admin
```

All requests in this section require:

```text
Bearer Token: {{adminToken}}
```

If you use `buyerToken` or `sellerToken`, admin routes should return:

```text
403 Forbidden
```

### 10.1 List Users

```http
GET {{baseUrl}}/api/admin/users?page=1&limit=20
```

Expected:

```text
200 OK
```

Expected data:

| Field | Notes |
|---|---|
| `data.items` | array of users |
| `data.meta.page` | current page |
| `data.meta.limit` | page size |
| `data.meta.total` | total users |

### 10.2 Create Business Owner

Use this route if you want admin to create the seller. If you already registered seller directly, you can skip this.

```http
POST {{baseUrl}}/api/admin/business-owner
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "name": "Postman Seller",
  "email": "{{sellerEmail}}",
  "password": "{{testPassword}}",
  "phone": "010000003",
  "address": "Seller created by admin"
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Business owner created successfully
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `sellerId` |

After this, login seller through `/api/auth/login` and save `sellerToken`.

### 10.3 Update Business Owner

```http
PUT {{baseUrl}}/api/admin/business-owner/{{sellerId}}
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "name": "Postman Seller Updated",
  "phone": "011111111",
  "address": "Updated seller address",
  "status": true
}
```

Expected:

```text
200 OK
```

Expected message:

```text
Business owner updated successfully
```

### 10.4 Delete Business Owner

Only run this near the end, because it disables the seller account.

```http
DELETE {{baseUrl}}/api/admin/business-owner/{{sellerId}}
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
204 No Content
```

Important: the service sets the seller `status` to `false`; it does not physically delete the user row.

### 10.5 List All Products As Admin

```http
GET {{baseUrl}}/api/admin/products?page=1&limit=20
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
200 OK
```

Notes:

| Behavior | Details |
|---|---|
| Includes inactive products | yes |
| Supports pagination | `page`, `limit` |
| Supports product filters | same filters as public product list |

### 10.6 Delete Product As Admin

Only run this near the end, because it disables the product.

```http
DELETE {{baseUrl}}/api/admin/products/{{productId}}
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
204 No Content
```

Important: the product is soft-disabled by setting `status` to `false`.

### 10.7 List All Orders As Admin

```http
GET {{baseUrl}}/api/admin/orders?page=1&limit=20
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
200 OK
```

Expected data:

| Field | Notes |
|---|---|
| `data.items` | array of orders |
| `data.items[].buyer` | buyer relation |
| `data.items[].items` | ordered products |
| `data.meta` | pagination |

### 10.8 List All Notifications As Admin

```http
GET {{baseUrl}}/api/admin/notifications
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
200 OK
```

### 10.9 Admin Analytics

```http
GET {{baseUrl}}/api/admin/analytics
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
200 OK
```

Expected data fields:

| Field | Meaning |
|---|---|
| `users` | total users |
| `sellers` | total business owners |
| `buyers` | total buyers |
| `products` | total products |
| `orders` | total orders |
| `payments` | total payments |
| `revenue` | total paid payment amount |

## 11. Category Testing

Base path:

```text
{{baseUrl}}/api/categories
```

Public routes:

| Route | Auth |
|---|---|
| `GET /api/categories` | none |
| `GET /api/categories/:id` | none |

Admin-only routes:

| Route | Auth |
|---|---|
| `POST /api/categories` | admin |
| `PUT /api/categories/:id` | admin |
| `DELETE /api/categories/:id` | admin |

### 11.1 Create Category

```http
POST {{baseUrl}}/api/categories
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "name": "Postman Electronics",
  "description": "Devices and accessories created during Postman testing"
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Category created successfully
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `categoryId` |

If you get:

```text
Category already exists
```

Change the category name and send again.

### 11.2 List Categories

```http
GET {{baseUrl}}/api/categories
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

Expected data:

```text
data is an array of categories
```

### 11.3 Get Category By ID

```http
GET {{baseUrl}}/api/categories/{{categoryId}}
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

### 11.4 Update Category

```http
PUT {{baseUrl}}/api/categories/{{categoryId}}
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "name": "Postman Electronics Updated",
  "description": "Updated during Postman testing"
}
```

Expected:

```text
200 OK
```

Expected message:

```text
Category updated successfully
```

### 11.5 Delete Category

Only run this after all product tests that use the category.

```http
DELETE {{baseUrl}}/api/categories/{{categoryId}}
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
204 No Content
```

## 12. Product Testing

Base path:

```text
{{baseUrl}}/api/products
```

Public product routes do not need a token. Create/update/delete need admin or seller token.

### Product Query Parameters

Use these with `GET /api/products` or `GET /api/products/search`:

| Query | Example | Meaning |
|---|---|---|
| `page` | `1` | page number |
| `limit` | `20` | page size, max 100 |
| `search` | `headphones` | searches name and description |
| `category` | `{{categoryId}}` | category ID or category name |
| `minPrice` | `10` | minimum price |
| `maxPrice` | `100` | maximum price |
| `sort` | `price_asc` | sort by price ascending |
| `sort` | `price_desc` | sort by price descending |
| `sort` | `name` | sort by product name |
| `sellerId` | `{{sellerId}}` | products by seller |

### 12.1 Create Product As Seller

Recommended for normal seller testing.

```http
POST {{baseUrl}}/api/seller/products
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Body:

```json
{
  "name": "Postman Wireless Headphones",
  "description": "Wireless headphones created directly from Postman",
  "price": 49.99,
  "stock": 25,
  "categoryId": "{{categoryId}}",
  "image": "https://example.com/headphones.png",
  "sku": "{{productSku}}"
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Product created successfully
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `productId` |

If you get duplicate SKU, change `productSku`.

### 12.2 Create Product As Admin

Use this if you want admin to create a product for a seller.

```http
POST {{baseUrl}}/api/products
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "name": "Admin Created Postman Product",
  "description": "Product created by admin during Postman testing",
  "price": 29.99,
  "stock": 15,
  "categoryId": "{{categoryId}}",
  "sellerId": "{{sellerId}}",
  "image": "https://example.com/product.png",
  "sku": "{{productSku}}"
}
```

Expected:

```text
201 Created
```

Save `data.id` as `productId`.

### 12.3 List Products

```http
GET {{baseUrl}}/api/products?page=1&limit=20
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

Expected data:

| Field | Notes |
|---|---|
| `data.items` | product array |
| `data.meta.page` | page |
| `data.meta.limit` | limit |
| `data.meta.total` | total products |

### 12.4 Search Products

```http
GET {{baseUrl}}/api/products/search?search=headphones&page=1&limit=10
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

### 12.5 Filter Products By Category

By category ID:

```http
GET {{baseUrl}}/api/products/category/{{categoryId}}
```

By query parameter:

```http
GET {{baseUrl}}/api/products?category={{categoryId}}
```

Expected:

```text
200 OK
```

### 12.6 Filter Products By Price

```http
GET {{baseUrl}}/api/products?minPrice=10&maxPrice=100&sort=price_asc
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

### 12.7 Get Top Rated Products

```http
GET {{baseUrl}}/api/products/top-rated?limit=10
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

Notes:

| Rule | Details |
|---|---|
| default limit | `10` |
| min limit | `1` |
| max limit | `50` |

### 12.8 Get Product By ID

```http
GET {{baseUrl}}/api/products/{{productId}}
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

Expected related data may include:

| Field | Notes |
|---|---|
| `data.category` | category object |
| `data.seller` | seller object |
| `data.reviews` | review array |

### 12.9 Update Product As Seller

Seller can update only their own product.

```http
PUT {{baseUrl}}/api/seller/products/{{productId}}
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Body:

```json
{
  "name": "Postman Wireless Headphones Updated",
  "description": "Updated directly from Postman",
  "price": 44.99,
  "stock": 20,
  "categoryId": "{{categoryId}}",
  "image": "https://example.com/headphones-updated.png",
  "sku": "{{productSku}}",
  "status": true
}
```

Expected:

```text
200 OK
```

Expected message:

```text
Product updated successfully
```

### 12.10 Update Product As Admin

```http
PUT {{baseUrl}}/api/products/{{productId}}
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "price": 39.99,
  "stock": 30,
  "status": true
}
```

Expected:

```text
200 OK
```

### 12.11 Delete Product

Run this near the end because it disables the product and buyer cart/checkout tests need an active product.

Seller route:

```http
DELETE {{baseUrl}}/api/seller/products/{{productId}}
```

Admin route:

```http
DELETE {{baseUrl}}/api/products/{{productId}}
```

Expected:

```text
204 No Content
```

## 13. Seller Testing

Base path:

```text
{{baseUrl}}/api/seller
```

All seller routes require:

```text
Bearer Token: {{sellerToken}}
```

### 13.1 List Seller Products

```http
GET {{baseUrl}}/api/seller/products?page=1&limit=20
```

Expected:

```text
200 OK
```

This lists products for the logged-in seller only and includes inactive products.

### 13.2 List Seller Orders

Run this after buyer checkout.

```http
GET {{baseUrl}}/api/seller/orders?page=1&limit=20
```

Expected:

```text
200 OK
```

Expected:

```text
data.items contains orders that include this seller's products
```

### 13.3 List Seller Payments

Run this after buyer payment.

```http
GET {{baseUrl}}/api/seller/payments?page=1&limit=20
```

Expected:

```text
200 OK
```

### 13.4 Update Seller Profile

```http
PUT {{baseUrl}}/api/seller/profile
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Body:

```json
{
  "name": "Postman Seller Updated",
  "phone": "012222222",
  "address": "Updated seller profile address"
}
```

Expected:

```text
200 OK
```

Expected message:

```text
Seller profile updated successfully
```

## 14. Cart Testing

Base path:

```text
{{baseUrl}}/api/cart
```

All cart routes require:

```text
Bearer Token: {{buyerToken}}
```

Cart routes only work for `Buyer` users.

### 14.1 Get Buyer Cart

```http
GET {{baseUrl}}/api/cart
```

Expected:

```text
200 OK
```

If the buyer has no cart yet, the API creates an empty cart.

Expected data:

| Field | Notes |
|---|---|
| `data.id` | cart ID |
| `data.buyerId` | buyer user ID |
| `data.items` | cart item array |

### 14.2 Add Product To Cart

Product must be active and have enough stock.

```http
POST {{baseUrl}}/api/cart
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "productId": "{{productId}}",
  "quantity": 1
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Product added to cart
```

Save:

| Response field | Save as |
|---|---|
| `data.items[0].id` | `cartItemId` |

If the cart already has items, save the item where:

```text
data.items[].productId equals productId
```

### 14.3 Update Cart Item Quantity

```http
PUT {{baseUrl}}/api/cart/{{cartItemId}}
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "quantity": 2
}
```

Expected:

```text
200 OK
```

Expected message:

```text
Cart updated successfully
```

Quantity rules:

| Value | Behavior |
|---|---|
| `1` or more | updates quantity |
| `0` | removes the cart item |
| negative number | removes the cart item |
| decimal or invalid value | treated like `0` by this controller and removes the cart item |

For validation testing, use `POST /api/cart` with `quantity: 0`; that route returns `400`.

### 14.4 Delete Cart Item

Do this only if you are not about to checkout, or add the product again after deleting.

```http
DELETE {{baseUrl}}/api/cart/{{cartItemId}}
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
204 No Content
```

## 15. Favorite Testing

Base path:

```text
{{baseUrl}}/api/favorites
```

All favorite routes require:

```text
Bearer Token: {{buyerToken}}
```

### 15.1 Add Favorite

```http
POST {{baseUrl}}/api/favorites
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "productId": "{{productId}}"
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Product added to favorites
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `favoriteId` |

If you send the same product again, the API returns the existing favorite.

### 15.2 List Favorites

```http
GET {{baseUrl}}/api/favorites
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Expected:

```text
data is an array of favorite records
```

### 15.3 Delete Favorite

You can use either the favorite ID or product ID.

By favorite ID:

```http
DELETE {{baseUrl}}/api/favorites/{{favoriteId}}
```

By product ID:

```http
DELETE {{baseUrl}}/api/favorites/{{productId}}
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
204 No Content
```

## 16. Review Testing

Base path:

```text
{{baseUrl}}/api/reviews
```

### 16.1 List Product Reviews

```http
GET {{baseUrl}}/api/reviews/{{productId}}
```

Auth:

```text
No Auth
```

Expected:

```text
200 OK
```

Expected data:

| Field | Notes |
|---|---|
| `data.items` | review array |
| `data.meta.count` | number of reviews |
| `data.meta.averageRating` | average rating |

### 16.2 Create Review

```http
POST {{baseUrl}}/api/reviews
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "productId": "{{productId}}",
  "rating": 5,
  "comment": "Great product tested directly in Postman"
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Review saved successfully
```

Rules:

| Rule | Details |
|---|---|
| `rating` | must be whole number from `1` to `5` |
| `productId` | must be active product |
| one buyer/product review | sending again updates existing review |

### 16.3 Update Review

Send the same endpoint again with a different rating/comment:

```http
POST {{baseUrl}}/api/reviews
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "productId": "{{productId}}",
  "rating": 4,
  "comment": "Updated review from Postman"
}
```

Expected:

```text
201 Created
```

The existing review is updated.

## 17. Order Testing

Base path:

```text
{{baseUrl}}/api/orders
```

All order routes require authentication.

Order visibility:

| User | What they can see |
|---|---|
| Admin | all orders |
| Seller | orders containing their products |
| Buyer | their own orders |

### 17.1 Checkout Buyer Cart

Before this request:

1. Product must exist.
2. Product must be active.
3. Product stock must be enough.
4. Buyer cart must have at least one item.

```http
POST {{baseUrl}}/api/orders/checkout
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```text
No body
```

Expected:

```text
201 Created
```

Expected message:

```text
Order created successfully
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `orderId` |

Important behavior:

| Behavior | Details |
|---|---|
| Creates order | yes |
| Creates order items | yes |
| Reduces product stock | yes |
| Clears cart | yes |
| Creates notification | yes |
| Initial `paymentStatus` | `pending` |
| Initial `orderStatus` | `pending` |

### 17.2 Checkout Alias

This route does the same checkout action:

```http
POST {{baseUrl}}/api/checkout
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
201 Created
```

Do not run both checkout routes on the same cart unless you add items again. The first checkout clears the cart.

### 17.3 List Orders As Buyer

```http
GET {{baseUrl}}/api/orders?page=1&limit=20
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Expected:

```text
data.items contains only this buyer's orders
```

### 17.4 List Orders As Seller

```http
GET {{baseUrl}}/api/orders?page=1&limit=20
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Expected:

```text
200 OK
```

Expected:

```text
data.items contains orders that include seller products
```

### 17.5 List Orders As Admin

```http
GET {{baseUrl}}/api/orders?page=1&limit=20
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
200 OK
```

### 17.6 Get Order By ID

Buyer:

```http
GET {{baseUrl}}/api/orders/{{orderId}}
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Seller can get the order only if it contains the seller's product.

Admin can get any order.

### 17.7 Update Order Status As Admin

```http
PUT {{baseUrl}}/api/orders/{{orderId}}/status
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "orderStatus": "confirmed",
  "paymentStatus": "paid"
}
```

Expected:

```text
200 OK
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

### 17.8 Update Order Status As Seller

Seller can update `orderStatus`, but cannot update `paymentStatus`.

```http
PUT {{baseUrl}}/api/orders/{{orderId}}/status
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Body:

```json
{
  "orderStatus": "processing"
}
```

Expected:

```text
200 OK
```

If seller sends `paymentStatus`, expected:

```text
403 Forbidden
```

## 18. Payment Testing

Base path:

```text
{{baseUrl}}/api/payments
```

All payment routes require authentication.

Payment visibility:

| User | What they can see |
|---|---|
| Admin | all payments |
| Seller | payments for orders containing their products |
| Buyer | their own payments |

### 18.1 Pay With PayPal

Before this request:

1. Buyer must have an order.
2. `orderId` must belong to the buyer.
3. Order must not already be paid.

```http
POST {{baseUrl}}/api/payments/paypal
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "orderId": "{{orderId}}"
}
```

Expected:

```text
201 Created
```

Expected message:

```text
PayPal payment processed
```

Save:

| Response field | Save as |
|---|---|
| `data.payment.id` | `paymentId` |

Expected simulated PayPal data if PayPal credentials are empty:

```json
{
  "paypal": {
    "id": "SIM-...",
    "status": "COMPLETED",
    "simulated": true
  }
}
```

Expected payment behavior:

| Field | Expected |
|---|---|
| `data.payment.paymentMethod` | `PayPal` |
| `data.payment.paymentStatus` | `paid` if simulated PayPal completed |
| `data.payment.orderId` | same as `orderId` |
| `data.payment.buyerId` | same as `buyerId` |

### 18.2 List Payments As Buyer

```http
GET {{baseUrl}}/api/payments?page=1&limit=20
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Expected:

```text
data.items contains only buyer payments
```

### 18.3 List Payments As Seller

```http
GET {{baseUrl}}/api/payments?page=1&limit=20
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Expected:

```text
200 OK
```

### 18.4 List Payments As Admin

```http
GET {{baseUrl}}/api/payments?page=1&limit=20
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Expected:

```text
200 OK
```

### 18.5 Get Payment By ID

```http
GET {{baseUrl}}/api/payments/{{paymentId}}
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Admin can get any payment. Seller can get the payment only if it belongs to an order containing the seller's product.

## 19. Notification Testing

Base path:

```text
{{baseUrl}}/api/notifications
```

### 19.1 Create Notification As Admin

Create notification for a specific buyer:

```http
POST {{baseUrl}}/api/notifications
```

Auth:

```text
Bearer Token: {{adminToken}}
```

Body:

```json
{
  "userId": "{{buyerId}}",
  "type": "admin_alert",
  "title": "Postman Notice",
  "message": "This notification was created directly from Postman."
}
```

Expected:

```text
201 Created
```

Expected message:

```text
Notification created successfully
```

Save:

| Response field | Save as |
|---|---|
| `data.id` | `notificationId` |

Create global notification:

```json
{
  "userId": null,
  "type": "admin_alert",
  "title": "Global Postman Notice",
  "message": "All users can see this global notification."
}
```

### 19.2 List My Notifications

```http
GET {{baseUrl}}/api/notifications
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
200 OK
```

Expected data:

```text
data is an array of notifications for this user plus global notifications
```

### 19.3 Mark Notification As Read

```http
PUT {{baseUrl}}/api/notifications/{{notificationId}}/read
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```text
No body
```

Expected:

```text
200 OK
```

Expected:

```text
data.isRead is true
```

If a user tries to mark another user's private notification, the API returns success with `data: null`.

## 20. Negative Testing

Use these tests to confirm auth and validation behavior.

### 20.1 Missing Token

```http
GET {{baseUrl}}/api/cart
```

Auth:

```text
No Auth
```

Expected:

```text
401 Unauthorized
```

Expected message:

```text
Missing authorization token
```

### 20.2 Buyer Accessing Admin Route

```http
GET {{baseUrl}}/api/admin/users
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
403 Forbidden
```

Expected message:

```text
You do not have permission to access this resource
```

### 20.3 Wrong Login Password

```http
POST {{baseUrl}}/api/auth/login
```

Auth:

```text
No Auth
```

Body:

```json
{
  "email": "{{buyerEmail}}",
  "password": "wrong-password"
}
```

Expected:

```text
401 Unauthorized
```

### 20.4 Invalid Register Email

```http
POST {{baseUrl}}/api/auth/register
```

Body:

```json
{
  "name": "Bad Email",
  "email": "not-an-email",
  "password": "{{testPassword}}",
  "role": "Buyer"
}
```

Expected:

```text
400 Bad Request
```

### 20.5 Register Admin Role Publicly

```http
POST {{baseUrl}}/api/auth/register
```

Body:

```json
{
  "name": "Invalid Admin",
  "email": "invalid.admin@example.com",
  "password": "{{testPassword}}",
  "role": "Admin"
}
```

Expected:

```text
400 Bad Request
```

Expected message:

```text
Role must be Buyer or BusinessOwner
```

### 20.6 Invalid Product Price

```http
POST {{baseUrl}}/api/seller/products
```

Auth:

```text
Bearer Token: {{sellerToken}}
```

Body:

```json
{
  "name": "Invalid Product",
  "price": -1,
  "stock": 10,
  "categoryId": "{{categoryId}}",
  "sku": "INVALID-PRICE-001"
}
```

Expected:

```text
400 Bad Request
```

### 20.7 Invalid Cart Quantity

```http
POST {{baseUrl}}/api/cart
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "productId": "{{productId}}",
  "quantity": 0
}
```

Expected:

```text
400 Bad Request
```

Expected message:

```text
Quantity must be at least 1
```

### 20.8 Empty Cart Checkout

```http
POST {{baseUrl}}/api/orders/checkout
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Expected:

```text
400 Bad Request
```

Expected message:

```text
Cart is empty
```

This only happens if the buyer cart has no items.

### 20.9 Invalid Review Rating

```http
POST {{baseUrl}}/api/reviews
```

Auth:

```text
Bearer Token: {{buyerToken}}
```

Body:

```json
{
  "productId": "{{productId}}",
  "rating": 6,
  "comment": "Invalid rating"
}
```

Expected:

```text
400 Bad Request
```

Expected message:

```text
Rating must be between 1 and 5
```

### 20.10 Resource Not Found

```http
GET {{baseUrl}}/api/products/not-found
```

Auth:

```text
No Auth
```

Expected:

```text
404 Not Found
```

## 21. Direct Endpoint Checklist

Use this as a final checklist after testing.

| Done | Method | URL | Auth |
|---|---|---|---|
|  | `GET` | `{{baseUrl}}/` | none |
|  | `POST` | `{{baseUrl}}/api/auth/register` | none |
|  | `POST` | `{{baseUrl}}/api/auth/login` | none |
|  | `POST` | `{{baseUrl}}/api/auth/logout` | any user |
|  | `GET` | `{{baseUrl}}/api/auth/profile` | any user |
|  | `PUT` | `{{baseUrl}}/api/auth/profile` | any user |
|  | `GET` | `{{baseUrl}}/api/admin/users` | admin |
|  | `POST` | `{{baseUrl}}/api/admin/business-owner` | admin |
|  | `PUT` | `{{baseUrl}}/api/admin/business-owner/{{sellerId}}` | admin |
|  | `DELETE` | `{{baseUrl}}/api/admin/business-owner/{{sellerId}}` | admin |
|  | `GET` | `{{baseUrl}}/api/admin/products` | admin |
|  | `DELETE` | `{{baseUrl}}/api/admin/products/{{productId}}` | admin |
|  | `GET` | `{{baseUrl}}/api/admin/orders` | admin |
|  | `GET` | `{{baseUrl}}/api/admin/notifications` | admin |
|  | `GET` | `{{baseUrl}}/api/admin/analytics` | admin |
|  | `GET` | `{{baseUrl}}/api/seller/products` | seller |
|  | `POST` | `{{baseUrl}}/api/seller/products` | seller |
|  | `PUT` | `{{baseUrl}}/api/seller/products/{{productId}}` | seller |
|  | `DELETE` | `{{baseUrl}}/api/seller/products/{{productId}}` | seller |
|  | `GET` | `{{baseUrl}}/api/seller/orders` | seller |
|  | `GET` | `{{baseUrl}}/api/seller/payments` | seller |
|  | `PUT` | `{{baseUrl}}/api/seller/profile` | seller |
|  | `GET` | `{{baseUrl}}/api/categories` | none |
|  | `GET` | `{{baseUrl}}/api/categories/{{categoryId}}` | none |
|  | `POST` | `{{baseUrl}}/api/categories` | admin |
|  | `PUT` | `{{baseUrl}}/api/categories/{{categoryId}}` | admin |
|  | `DELETE` | `{{baseUrl}}/api/categories/{{categoryId}}` | admin |
|  | `GET` | `{{baseUrl}}/api/products` | none |
|  | `GET` | `{{baseUrl}}/api/products/search?search=headphones` | none |
|  | `GET` | `{{baseUrl}}/api/products/top-rated?limit=10` | none |
|  | `GET` | `{{baseUrl}}/api/products/category/{{categoryId}}` | none |
|  | `GET` | `{{baseUrl}}/api/products/{{productId}}` | none |
|  | `POST` | `{{baseUrl}}/api/products` | admin or seller |
|  | `PUT` | `{{baseUrl}}/api/products/{{productId}}` | admin or seller |
|  | `DELETE` | `{{baseUrl}}/api/products/{{productId}}` | admin or seller |
|  | `GET` | `{{baseUrl}}/api/cart` | buyer |
|  | `POST` | `{{baseUrl}}/api/cart` | buyer |
|  | `PUT` | `{{baseUrl}}/api/cart/{{cartItemId}}` | buyer |
|  | `DELETE` | `{{baseUrl}}/api/cart/{{cartItemId}}` | buyer |
|  | `GET` | `{{baseUrl}}/api/favorites` | buyer |
|  | `POST` | `{{baseUrl}}/api/favorites` | buyer |
|  | `DELETE` | `{{baseUrl}}/api/favorites/{{favoriteId}}` | buyer |
|  | `GET` | `{{baseUrl}}/api/reviews/{{productId}}` | none |
|  | `POST` | `{{baseUrl}}/api/reviews` | buyer |
|  | `GET` | `{{baseUrl}}/api/orders` | any user |
|  | `GET` | `{{baseUrl}}/api/orders/{{orderId}}` | owner/admin/seller |
|  | `PUT` | `{{baseUrl}}/api/orders/{{orderId}}/status` | admin or seller |
|  | `POST` | `{{baseUrl}}/api/orders/checkout` | buyer |
|  | `POST` | `{{baseUrl}}/api/checkout` | buyer |
|  | `GET` | `{{baseUrl}}/api/payments` | any user |
|  | `GET` | `{{baseUrl}}/api/payments/{{paymentId}}` | owner/admin/seller |
|  | `POST` | `{{baseUrl}}/api/payments/paypal` | buyer |
|  | `GET` | `{{baseUrl}}/api/notifications` | any user |
|  | `POST` | `{{baseUrl}}/api/notifications` | admin |
|  | `PUT` | `{{baseUrl}}/api/notifications/{{notificationId}}/read` | visible notification user |

## 22. Common Problems While Testing

| Problem | Cause | Fix |
|---|---|---|
| `401 Missing authorization token` | No bearer token | Add token in Authorization tab |
| `401 Invalid authorization token` | Bad/old token or wrong JWT secret | Login again and save new token |
| `403 permission` | Wrong user role | Use admin/seller/buyer token required by route |
| `Email already registered` | Reusing old email | Change email variable |
| `Category already exists` | Reusing category name | Change category name |
| duplicate SKU error | Reusing product SKU | Change `productSku` |
| `Category does not exist` | Wrong `categoryId` | Create/list category and copy correct ID |
| `Seller must be an admin or business owner account` | Wrong `sellerId` | Use a `BusinessOwner` user ID |
| `Product not found` | Wrong product ID or inactive product | Create a new active product |
| `Not enough product stock` | Quantity is higher than stock | Lower cart quantity or update product stock |
| `Cart is empty` | Checkout after cart was cleared | Add product to cart again |
| `Order is already paid` | Paying same order twice | Create a new order |
