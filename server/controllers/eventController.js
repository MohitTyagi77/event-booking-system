import { createEvent, deleteEvent, getEventById, getEvents, updateEvent } from '../models/eventModel.js';

const formatError = (error) => error?.message || String(error);

const validateEventPayload = (payload) => {
  const required = ['title', 'description', 'location', 'date', 'total_seats', 'available_seats', 'price'];
  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      return `${field} is required`;
    }
  }

  if (Number(payload.total_seats) <= 0 || Number(payload.available_seats) < 0) {
    return 'Seat values are invalid';
  }

  if (Number(payload.available_seats) > Number(payload.total_seats)) {
    return 'available_seats cannot exceed total_seats';
  }

  if (Number(payload.price) < 0) {
    return 'price cannot be negative';
  }

  return null;
};

export const createEventHandler = async (req, res) => {
  try {
    const validationError = validateEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const id = await createEvent(req.body);
    res.status(201).json({ message: 'Event created successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: formatError(error) });
  }
};

export const getEventsHandler = async (req, res) => {
  try {
    const events = await getEvents(req.query);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: formatError(error) });
  }
};

export const getEventByIdHandler = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: formatError(error) });
  }
};

export const updateEventHandler = async (req, res) => {
  try {
    const validationError = validateEventPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const affectedRows = await updateEvent(req.params.id, req.body);
    if (!affectedRows) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: formatError(error) });
  }
};

export const deleteEventHandler = async (req, res) => {
  try {
    const affectedRows = await deleteEvent(req.params.id);
    if (!affectedRows) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: formatError(error) });
  }
};
