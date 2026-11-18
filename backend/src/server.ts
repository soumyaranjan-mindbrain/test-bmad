import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { initializeSocketServer } from './real-time/socketServer.js';

const server = http.createServer(app);

// Initialize Socket.IO Server attached to HTTP server
export const io = initializeSocketServer(server);

export async function startServer() {
  await connectDatabase();
  return new Promise<void>((resolve) => {
    server.listen(env.PORT, () => {
      console.log(`[TaskFlow Backend] Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`[TaskFlow Real-Time] Socket.IO gateway initialized and listening`);
      console.log(`[TaskFlow Backend] Healthcheck accessible at http://localhost:${env.PORT}/api/v1/health`);
      resolve();
    });
  });
}

// Only start listening automatically when run directly as main entry point
if (process.argv[1] && process.argv[1].endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  startServer();
}
