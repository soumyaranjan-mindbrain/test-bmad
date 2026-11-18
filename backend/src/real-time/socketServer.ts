import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/token.js';
import { OrganizationMember } from '../models/OrganizationMember.js';
import { ProjectMember } from '../models/ProjectMember.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
  isSuperAdmin?: boolean;
}

let ioInstance: Server | null = null;

export function initializeSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // 1. Authenticate Socket Connections via JWT Token in auth handshake
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      // In development, allow dev mock connection if token is dev_mock_token
      if (env.NODE_ENV === 'development' && token === 'dev_mock_token') {
        socket.userId = 'dev_user_1';
        socket.email = 'alex.morgan@nexus.io';
        socket.isSuperAdmin = true;
        return next();
      }

      if (!token) {
        return next(new Error('Authentication required for WebSocket connection.'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.email = decoded.email;
      socket.isSuperAdmin = decoded.isSuperAdmin;
      next();
    } catch {
      next(new Error('Invalid or expired WebSocket token.'));
    }
  });

  // 2. Room Subscriptions & Event Handlers
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    // Auto-join private user channel for direct alerts & timer sync
    socket.join(`user:${userId}`);

    // Join Organization Room (Verifies active membership)
    socket.on('join:org', async ({ orgId }: { orgId: string }) => {
      try {
        const membership = await OrganizationMember.findOne({
          organizationId: orgId,
          userId,
          status: 'active',
        });

        if (membership || socket.isSuperAdmin) {
          socket.join(`org:${orgId}`);
          io.to(`org:${orgId}`).emit('presence:change', {
            userId,
            status: 'online',
            timestamp: new Date().toISOString(),
          });
        } else {
          socket.emit('error', { message: 'Unauthorized organization room access.' });
        }
      } catch (err) {
        console.error('[Socket Room Error]', err);
      }
    });

    // Leave Organization Room
    socket.on('leave:org', ({ orgId }: { orgId: string }) => {
      socket.leave(`org:${orgId}`);
    });

    // Join Project Room (Verifies Project Access)
    socket.on('join:project', async ({ projectId, orgId }: { projectId: string; orgId: string }) => {
      try {
        const member = await ProjectMember.findOne({
          projectId,
          userId,
        });

        if (member || socket.isSuperAdmin) {
          socket.join(`project:${projectId}`);
        } else {
          socket.emit('error', { message: 'Unauthorized project room access.' });
        }
      } catch (err) {
        console.error('[Socket Project Room Error]', err);
      }
    });

    // Leave Project Room
    socket.on('leave:project', ({ projectId }: { projectId: string }) => {
      socket.leave(`project:${projectId}`);
    });

    // Join Task Drawer Room
    socket.on('join:task', ({ taskId }: { taskId: string }) => {
      socket.join(`task:${taskId}`);
    });

    // Leave Task Drawer Room
    socket.on('leave:task', ({ taskId }: { taskId: string }) => {
      socket.leave(`task:${taskId}`);
    });

    socket.on('disconnect', () => {
      // Disconnect cleanup
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return ioInstance;
}
