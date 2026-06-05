import app from './app.js';
import { AppDataSource } from './database/data-source.js';
import { env } from './config/env.config.js';

const startServer = async () => {
  await AppDataSource.initialize();

  const server = app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });

  server.on('error', (err) => {
    console.error('Server failed to start:', err.message);
    process.exit(1);
  });

  const cleanup = () => {
    server.close(() => {
      void AppDataSource.destroy().finally(() => process.exit(0));
    });
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
};

startServer().catch((err: unknown) => {
  console.error('Unable to start server:', err);
  process.exit(1);
});
