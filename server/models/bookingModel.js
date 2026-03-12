import pool from '../config/db.js';

export const createBooking = async (bookingData, connection = pool) => {
  const { event_id, name, email, mobile, quantity, total_amount, status = 'confirmed' } = bookingData;
  const [result] = await connection.execute(
    `INSERT INTO bookings (event_id, name, email, mobile, quantity, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [event_id, name, email, mobile, quantity, total_amount, status]
  );
  return result.insertId;
};

export const getBookings = async ({ eventId } = {}) => {
  const params = [];
  const whereClause = eventId ? 'WHERE b.event_id = ?' : '';

  if (eventId) params.push(eventId);

  const [rows] = await pool.execute(
    `SELECT b.*, e.title AS event_title, e.date AS event_date, e.location AS event_location
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     ${whereClause}
     ORDER BY b.booking_date DESC`,
    params
  );
  return rows;
};

export const getBookingById = async (bookingId) => {
  const [rows] = await pool.execute(
    `SELECT b.*, e.title AS event_title, e.date AS event_date, e.location AS event_location, e.img AS event_img
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     WHERE b.id = ?`,
    [bookingId]
  );
  return rows[0];
};
