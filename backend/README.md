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

4. Start with file watching (auto-restart on changes):

```bash
npm run dev       # using nodemon.json config
npm run dev:watch # same as above
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
- `npm run dev` / `npm run dev:watch` — run with `nodemon` (auto-restart on `.ts`/`.json` changes).
- `npm run dev:ts` — run directly via `ts-node --esm` without file watching.
- Nodemon config is in `nodemon.json`.
Available Scripts:
| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm run dev:ts` | Start directly with ts-node |
| `npm run dev:watch` | Alias for `dev` |
| `npm run db:migrate:run` | Run pending migrations |
| `npm run db:migrate:revert` | Revert last migration |
| `npm run db:migration:create --name=X` | Create blank migration |
| `npm run db:migration:generate --name=X` | Generate migration from entity changes |
