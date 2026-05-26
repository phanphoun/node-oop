# Backend (BuyNow)

This folder contains the backend for BuyNow. It's scaffolded for TypeScript + Express + TypeORM.

Quick setup:

1. From `backend/` run:

```bash
npm install
```

2. Configure the database connection in `.env`.

3. Start the server in development:

```bash
npm run dev
```

4. Start with file watching:

```bash
npm run dev:watch
```

5. Manage database migrations:

```bash
npm run db:migrate:run
npm run db:migrate:revert
npm run db:migration:create --name=MyMigration
npm run db:migration:generate --name=MyMigration
```

Notes:
- The TypeScript entrypoint is `src/server.ts`.
- TypeORM is configured in `src/database/data-source.ts`.
- Migrations are stored under `src/database/migrations`.
- `npm run dev` runs the app via `ts-node --esm`.
- `npm run dev:watch` runs the app with `nodemon` and reloads on source changes.
