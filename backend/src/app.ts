import express from 'express';
import cors from 'cors';
import routes from './routes/index.ts';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res) => res.json({ message: 'BuyNow backend (TypeScript) - OK' }));

export default app;
