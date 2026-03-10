import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import eventRoutes from './routes/eventRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { getEventById } from './models/eventModel.js';
import { lockSeats, releaseAllLocksForSocket, releaseSeats } from './services/seatLockService.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes(io));

io.on('connection', (socket) => {
  socket.on('lockSeat', async ({ eventId, quantity }) => {
    try {
      const event = await getEventById(eventId);
      if (!event) {
        return socket.emit('seatLockResult', { ok: false, eventId, message: 'Event not found' });
      }

      const result = lockSeats({
        eventId: Number(eventId),
        socketId: socket.id,
        quantity,
        availableSeats: event.available_seats
      });

      socket.emit('seatLockResult', { eventId: Number(eventId), ...result });
      if (result.ok) {
        io.emit('seatLockUpdated', {
          eventId: Number(eventId),
          lockedSeats: result.lockedSeats,
          effectiveAvailableSeats: result.effectiveAvailableSeats
        });
      }
    } catch (error) {
      socket.emit('seatLockResult', { ok: false, eventId, message: 'Failed to lock seats' });
    }
  });

  socket.on('releaseSeat', async ({ eventId }) => {
    try {
      const event = await getEventById(eventId);
      if (!event) return;

      const result = releaseSeats({
        eventId: Number(eventId),
        socketId: socket.id,
        availableSeats: event.available_seats
      });

      io.emit('seatLockUpdated', {
        eventId: Number(eventId),
        lockedSeats: result.lockedSeats,
        effectiveAvailableSeats: result.effectiveAvailableSeats
      });
    } catch {
      // no-op
    }
  });

  socket.on('disconnect', () => {
    releaseAllLocksForSocket(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
