# Backend (BuyNow)

This folder contains the backend for BuyNow. It's scaffolded for TypeScript + Express + TypeORM.

Quick setup:

1. From `backend/` run:

```bash
npm install
```

2. Start in development (TypeScript):

```bash
npm run dev:ts
```

3. Manage database migrations:

```bash
npm run db:migrate:run
npm run db:migrate:revert
npm run db:migration:create --name=MyMigration
npm run db:migration:generate --name=MyMigration
```

Notes:
- The project retains the existing `index.js` (JavaScript) for compatibility. New TypeScript entrypoint is `src/server.ts`.
- Install and configure database (MySQL) and `.env` variables before enabling TypeORM.
- TypeORM is configured in `src/database/data-source.ts` and migrations live under `src/database/migrations`.
- I scaffolded a starter migration for the `users` table. I can continue wiring entities and repository layers next.
