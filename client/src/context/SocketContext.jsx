import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Only connect if we have a token
    const token = localStorage.getItem('token');
    
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      // console.log('🟢 Connected to WebSocket');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      // console.log('🔴 Disconnected from WebSocket');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []); // Note: Might need to re-run if token changes, but a full reload usually handles this

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
