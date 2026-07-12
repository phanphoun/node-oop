import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorMiddleware } from './core/middlewares/error.middleware.js';
import { NotFoundError } from './core/errors/not-found.error.js';
import { env } from './config/env.config.js';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (req,res) =>{
    res.send('Welcome to buynow website.')
})

app.use('/api', routes);

app.use((_req, _res, next) => next(new NotFoundError('Route not found')));
app.use(errorMiddleware);

export default app;
