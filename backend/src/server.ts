import dotenv from 'dotenv';
import app from './app.js';
import { AppDataSource } from './database/data-source.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(() => {
    console.log('Database connected');
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
      console.error('Server failed to start:', err.message);
      process.exit(1);
    });
    return server;
  })
  .then((server) => {
    const cleanup = () => {
      server.close(() => process.exit(0));
    };
    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
