import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorMiddleware } from './core/middlewares/error.middleware.js';
import { NotFoundError } from './core/errors/not-found.error.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ success: true, message: 'BuyNow backend API is running' }));

app.use('/api', routes);

app.use((_req, _res, next) => next(new NotFoundError('Route not found')));
app.use(errorMiddleware);

export default app;
