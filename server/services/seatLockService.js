const LOCK_TTL_MS = 2 * 60 * 1000;

const locksByEvent = new Map();

const now = () => Date.now();

const ensureEventMap = (eventId) => {
  if (!locksByEvent.has(eventId)) {
    locksByEvent.set(eventId, new Map());
  }
  return locksByEvent.get(eventId);
};

const cleanupExpiredLocks = (eventId) => {
  const eventLocks = locksByEvent.get(eventId);
  if (!eventLocks) return;

  for (const [socketId, lock] of eventLocks.entries()) {
    if (lock.expiresAt <= now()) {
      eventLocks.delete(socketId);
    }
  }

  if (!eventLocks.size) {
    locksByEvent.delete(eventId);
  }
};

export const getTotalLockedSeats = (eventId) => {
  cleanupExpiredLocks(eventId);
  const eventLocks = locksByEvent.get(eventId);
  if (!eventLocks) return 0;
  return Array.from(eventLocks.values()).reduce((acc, lock) => acc + lock.quantity, 0);
};

export const getLockedSeatsByOthers = (eventId, socketId) => {
  cleanupExpiredLocks(eventId);
  const eventLocks = locksByEvent.get(eventId);
  if (!eventLocks) return 0;

  let total = 0;
  for (const [id, lock] of eventLocks.entries()) {
    if (id !== socketId) total += lock.quantity;
  }
  return total;
};

export const lockSeats = ({ eventId, socketId, quantity, availableSeats }) => {
  const safeQty = Number(quantity);
  if (!safeQty || safeQty <= 0) {
    return { ok: false, message: 'Invalid lock quantity' };
  }

  cleanupExpiredLocks(eventId);
  const lockedByOthers = getLockedSeatsByOthers(eventId, socketId);
  const eventLocks = ensureEventMap(eventId);
  const seatsLeftForCurrentUser = Number(availableSeats) - lockedByOthers;
  if (safeQty > seatsLeftForCurrentUser) {
    return { ok: false, message: 'Seats are temporarily locked by other users' };
  }

  eventLocks.set(socketId, { quantity: safeQty, expiresAt: now() + LOCK_TTL_MS });

  return {
    ok: true,
    lockedSeats: getTotalLockedSeats(eventId),
    effectiveAvailableSeats: Number(availableSeats) - getTotalLockedSeats(eventId)
  };
};

export const releaseSeats = ({ eventId, socketId, availableSeats = 0 }) => {
  cleanupExpiredLocks(eventId);
  const eventLocks = locksByEvent.get(eventId);
  if (!eventLocks) {
    return { lockedSeats: 0, effectiveAvailableSeats: Number(availableSeats) };
  }

  eventLocks.delete(socketId);
  if (!eventLocks.size) {
    locksByEvent.delete(eventId);
  }

  return {
    lockedSeats: getTotalLockedSeats(eventId),
    effectiveAvailableSeats: Number(availableSeats) - getTotalLockedSeats(eventId)
  };
};

export const releaseAllLocksForSocket = (socketId) => {
  for (const [eventId, eventLocks] of locksByEvent.entries()) {
    eventLocks.delete(socketId);
    cleanupExpiredLocks(eventId);
  }
};


export const __resetSeatLocksForTests = () => {
  locksByEvent.clear();
};
