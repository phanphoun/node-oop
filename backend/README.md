# BuyNow Backend

TypeScript + Express + TypeORM API for the BuyNow ecommerce project.

## Tech Stack

- Node.js with ESM
- Express 5
- TypeScript
- TypeORM
- MySQL
- JWT authentication
- PayPal payment integration with simulated fallback when credentials are not configured

## Project Structure

```text
src/
  app.ts                         Express app and middleware setup
  server.ts                      Database initialization and HTTP server startup
  config/                        Environment config
  constants/                     Shared enums
  core/                          Errors, middleware, and utilities
  database/                      TypeORM data source and migrations
  modules/                       Feature modules and route handlers
  routes/index.ts                API route registration
tests/
  endpoints.test.ts              Endpoint smoke tests
```

## Setup

Install dependencies from `backend/`:

```bash
npm install
```

Create a `.env` file from `.env.example` and update the values for your local database:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=buy_now

JWT_SECRET=your_jwt_secret_key
PORT=4000

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox
```

Run migrations before starting the API when using a fresh database:

```bash
npm run db:migrate:run
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the API with nodemon |
| `npm run dev:watch` | Start the API with nodemon |
| `npm run dev:ts` | Start directly with `ts-node` |
| `npm start` | Start directly with `ts-node` |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm run start:prod` | Run the compiled server from `dist/` |
| `npm test` | Run endpoint smoke tests |
| `npm run db:migrate:run` | Run pending migrations |
| `npm run db:migrate:revert` | Revert the latest migration |
| `npm run db:migration:create -- <path>` | Create a blank migration |
| `npm run db:migration:generate -- <path>` | Generate a migration from entity changes |

## Running The Server

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run start:prod
```

The server listens on `PORT` from `.env`. The root route returns:

```text
GET / -> Welcome to buynow website.
```

## Testing

Run all endpoint smoke tests:

```bash
npm test
```

The test suite starts the Express app on a temporary local port and covers every registered endpoint. Service methods are mocked with fixtures, so the suite validates routing, authentication middleware, role middleware, controller status codes, and response shape without requiring a live MySQL database.

## Database Migrations

Migrations live in `src/database/migrations`. Each migration creates the final schema for its module, so there are no separate catch-up files like `CompleteBuyNowSchema`, `UpdateProductsSchema`, `UpdatePaymentsSchema`, or `AddUpdatedAtToUsers`.

Current migration order:

| Order | Migration | Purpose |
|---|---|---|
| 1 | `1685020000000-CreateUsersTable.ts` | Creates `users` with `created_at` and `updated_at` |
| 2 | `1685020000001-CreateCategoriesTable.ts` | Creates `categories` |
| 3 | `1685020000002-CreateProductsTable.ts` | Creates `products` with category and seller relations |
| 4 | `1688000000003-CreateCartsTables.ts` | Creates `carts` and `cart_items` |
| 5 | `1688000000004-CreateOrdersTables.ts` | Creates `orders` and `order_items` |
| 6 | `1688000000005-CreateFavoritesTable.ts` | Creates `favorites` |
| 7 | `1688000000006-CreateReviewsTable.ts` | Creates `reviews` |
| 8 | `1688000000007-CreatePaymentsTable.ts` | Creates `payments` with order and buyer relations |
| 9 | `1688000000008-CreateNotificationsTable.ts` | Creates `notifications` |

Run pending migrations:

```bash
npm run db:migrate:run
```

Generate a migration from entity changes:

```bash
npm run db:migration:generate -- src/database/migrations/MyMigrationName
```

Create a blank migration:

```bash
npm run db:migration:create -- src/database/migrations/MyMigrationName
```

## API Routes

All API routes are mounted under `/api`.

| Module | Routes |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/profile`, `PUT /auth/profile` |
| Admin | `GET /admin/users`, `POST /admin/business-owner`, `PUT /admin/business-owner/:id`, `DELETE /admin/business-owner/:id`, `GET /admin/products`, `DELETE /admin/products/:id`, `GET /admin/orders`, `GET /admin/notifications`, `GET /admin/analytics` |
| Seller | `GET /seller/products`, `POST /seller/products`, `PUT /seller/products/:id`, `DELETE /seller/products/:id`, `GET /seller/orders`, `GET /seller/payments`, `PUT /seller/profile` |
| Categories | `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id` |
| Products | `GET /products`, `GET /products/search`, `GET /products/top-rated`, `GET /products/category/:category`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` |
| Cart | `GET /cart`, `POST /cart`, `PUT /cart/:id`, `DELETE /cart/:id` |
| Favorites | `GET /favorites`, `POST /favorites`, `DELETE /favorites/:id` |
| Reviews | `GET /reviews/:productId`, `POST /reviews` |
| Orders | `GET /orders`, `GET /orders/:id`, `PUT /orders/:id/status`, `POST /orders/checkout`, `POST /checkout` |
| Payments | `GET /payments`, `GET /payments/:id`, `POST /payments/paypal` |
| Notifications | `GET /notifications`, `POST /notifications`, `PUT /notifications/:id/read` |

## Authentication And Roles

Protected endpoints expect a Bearer token:

```http
Authorization: Bearer <jwt>
```

Supported roles:

- `Admin`
- `BusinessOwner`
- `Buyer`

Role restrictions are enforced in route middleware. Admin routes require `Admin`, seller routes require `BusinessOwner`, and buyer workflows such as cart, favorites, reviews, checkout, and PayPal payments require `Buyer`.

## Notes

- TypeORM is configured in `src/database/data-source.ts`.
- Migrations are stored under `src/database/migrations` and compiled into `dist/database/migrations` during `npm run build`.
- `src/server.ts` initializes the database before the HTTP server starts.
- `src/app.ts` exports the Express app for tests and server startup.
