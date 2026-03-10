import pool from '../config/db.js';

export const createEvent = async (eventData) => {
  const { title, description, location, date, total_seats, available_seats, price, img } = eventData;
  const [result] = await pool.execute(
    `INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, location, date, total_seats, available_seats, price, img]
  );
  return result.insertId;
};

export const getEvents = async ({ search, location, date }) => {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (location) {
    conditions.push('location LIKE ?');
    params.push(`%${location}%`);
  }
  if (date) {
    conditions.push('DATE(date) = ?');
    params.push(date);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(`SELECT * FROM events ${whereClause} ORDER BY date ASC`, params);

  return rows;
};

export const getEventById = async (id, connection = pool) => {
  const [rows] = await connection.execute('SELECT * FROM events WHERE id = ?', [id]);
  return rows[0];
};

export const getEventByIdForUpdate = async (id, connection) => {
  const [rows] = await connection.execute('SELECT * FROM events WHERE id = ? FOR UPDATE', [id]);
  return rows[0];
};

export const updateEvent = async (id, eventData) => {
  const { title, description, location, date, total_seats, available_seats, price, img } = eventData;
  const [result] = await pool.execute(
    `UPDATE events
     SET title = ?, description = ?, location = ?, date = ?, total_seats = ?, available_seats = ?, price = ?, img = ?
     WHERE id = ?`,
    [title, description, location, date, total_seats, available_seats, price, img, id]
  );
  return result.affectedRows;
};

export const deleteEvent = async (id) => {
  const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows;
};

export const updateAvailableSeats = async (eventId, quantity, connection = pool) => {
  const [result] = await connection.execute(
    `UPDATE events
     SET available_seats = available_seats - ?
     WHERE id = ? AND available_seats >= ?`,
    [quantity, eventId, quantity]
  );
  return result.affectedRows;
};
