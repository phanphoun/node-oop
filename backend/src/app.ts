import express from 'express';
import cors from 'cors';
import routes from './routes/index.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res) => res.json({ message: 'BuyNow API' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({ success: false, message });
});

export default app;
