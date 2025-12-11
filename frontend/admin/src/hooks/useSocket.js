import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_IO_URL || 'http://localhost:4000';
const SOCKET_PATH = import.meta.env.VITE_SOCKET_IO_PATH || '/socket.io';
const ENABLE_REALTIME = import.meta.env.VITE_ENABLE_REALTIME !== 'false';

export function useSocket(enabled = true) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!enabled || !ENABLE_REALTIME) {
      return;
    }

    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      socket.emit('join:admin');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [enabled]);

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { socket: socketRef.current, connected, on, off };
}

