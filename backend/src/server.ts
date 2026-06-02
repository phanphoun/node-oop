import dotenv from 'dotenv';
import { AppDataSource } from './database/data-source.ts';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await AppDataSource.initialize();
    const { default: app } = await import('./app.ts');

    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server failed to start:', err.message);
      process.exit(1);
    });

    const cleanup = () => {
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
}

startServer();



