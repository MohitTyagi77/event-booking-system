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

export const getBookings = async () => {
  const [rows] = await pool.execute(
    `SELECT b.*, e.title AS event_title, e.date AS event_date
     FROM bookings b
     JOIN events e ON b.event_id = e.id
     ORDER BY b.booking_date DESC`
  );
  return rows;
};
