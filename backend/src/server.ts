import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

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
