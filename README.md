# node-oop

Full-stack application with **Node.js / Express / TypeORM** backend and **React 19 + Vite** frontend.

## Structure

```


node-oop/
├── backend/          # Express 5 API server
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── core/
│   │   ├── database/     # TypeORM data-source & migrations
│   │   ├── modules/       # Feature modules
│   │   ├── routes/
│   │   └── shared/
│   └── index.js
├── frontend/         # React 19 + Vite SPA
│   └── src/
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env   # configure your DB credentials
npm install
npm run dev            # nodemon (auto-restart)
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Vite dev server
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend with nodemon |
| `npm start` | Start backend in production |
| `npm run dev:ts` | Start backend (TypeScript) with ts-node |
| `npm run db:migrate:run` | Run TypeORM migrations |
| `npm run db:migration:generate` | Generate a new migration |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Database | MySQL (TypeORM) |
| Auth | JWT + bcrypt |
| Validation | class-validator |
| Frontend | React 19 + Vite |
