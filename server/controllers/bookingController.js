import pool from '../config/db.js';
import { createBooking, getBookings } from '../models/bookingModel.js';
import { getEventById, getEventByIdForUpdate, updateAvailableSeats } from '../models/eventModel.js';
import { getLockedSeatsByOthers, releaseSeats } from '../services/seatLockService.js';

const validEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const createBookingHandler = (io) => async (req, res) => {
  let connection;

  try {
    const { event_id, name, email, mobile, quantity, socket_id } = req.body;
    const qty = Number(quantity);

    if (!event_id || !name || !email || !mobile || !qty || qty <= 0) {
      return res.status(400).json({ message: 'event_id, name, email, mobile and positive quantity are required' });
    }

    if (!validEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const lockedByOthers = getLockedSeatsByOthers(Number(event_id), socket_id || '');

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const event = await getEventByIdForUpdate(event_id, connection);
    if (!event) {
      await connection.rollback();
      return res.status(404).json({ message: 'Event not found' });
    }

    const effectiveAvailable = Number(event.available_seats) - Number(lockedByOthers);
    if (effectiveAvailable < qty) {
      await connection.rollback();
      return res.status(409).json({ message: 'Seats are currently locked by other users. Please try again.' });
    }

    if (event.available_seats < qty) {
      await connection.rollback();
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const updated = await updateAvailableSeats(event_id, qty, connection);
    if (!updated) {
      await connection.rollback();
      return res.status(409).json({ message: 'Seat update conflict, please try again' });
    }

    const total_amount = Number(event.price) * qty;

    const bookingId = await createBooking(
      {
        event_id,
        name,
        email,
        mobile,
        quantity: qty,
        total_amount,
        status: 'confirmed'
      },
      connection
    );

    await connection.commit();

    const latestEvent = await getEventById(event_id);

    if (socket_id) {
      const releaseResult = releaseSeats({
        eventId: Number(event_id),
        socketId: socket_id,
        availableSeats: latestEvent.available_seats
      });

      io.emit('seatLockUpdated', {
        eventId: Number(event_id),
        lockedSeats: releaseResult.lockedSeats,
        effectiveAvailableSeats: releaseResult.effectiveAvailableSeats
      });
    }

    io.emit('seatUpdated', {
      eventId: Number(event_id),
      available_seats: latestEvent.available_seats
    });

    return res.status(201).json({
      message: 'Booking confirmed',
      bookingId,
      total_amount,
      event: latestEvent
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // no-op
      }
    }
    return res.status(500).json({ message: 'Booking failed', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

export const getBookingsHandler = async (_req, res) => {
  try {
    const bookings = await getBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
};
