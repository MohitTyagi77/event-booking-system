import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [seatUpdates, setSeatUpdates] = useState({});
  const [lockUpdates, setLockUpdates] = useState({});
  const [socketId, setSocketId] = useState('');

  const socket = useMemo(
    () =>
      io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket']
      }),
    []
  );

  useEffect(() => {
    socket.on('connect', () => setSocketId(socket.id));

    socket.on('seatUpdated', ({ eventId, available_seats }) => {
      setSeatUpdates((prev) => ({ ...prev, [eventId]: available_seats }));
    });

    socket.on('seatLockUpdated', ({ eventId, effectiveAvailableSeats, lockedSeats }) => {
      setLockUpdates((prev) => ({ ...prev, [eventId]: { effectiveAvailableSeats, lockedSeats } }));
    });

    return () => {
      socket.off('connect');
      socket.off('seatUpdated');
      socket.off('seatLockUpdated');
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, socketId, seatUpdates, lockUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketData = () => useContext(SocketContext);
