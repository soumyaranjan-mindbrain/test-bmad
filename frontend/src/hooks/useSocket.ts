import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(projectId?: string, onCardMoved?: (data: unknown) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initial handshake connecting to Socket.IO backend gateway
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: {
        token: 'dev_mock_token',
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (projectId) {
        socket.emit('join:project', { projectId });
      }
    });

    if (onCardMoved) {
      socket.on('card:moved', (data) => {
        onCardMoved(data);
      });
    }

    return () => {
      if (projectId) {
        socket.emit('leave:project', { projectId });
      }
      socket.disconnect();
    };
  }, [projectId, onCardMoved]);

  return socketRef.current;
}
