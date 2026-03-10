import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [seatUpdates, setSeatUpdates] = useState({});

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket']
      }),
    []
  );

  useEffect(() => {
    socket.on('seatUpdated', ({ eventId, available_seats }) => {
      setSeatUpdates((prev) => ({ ...prev, [eventId]: available_seats }));
    });

    return () => {
      socket.off('seatUpdated');
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={{ seatUpdates }}>{children}</SocketContext.Provider>;
};

export const useSocketData = () => useContext(SocketContext);
