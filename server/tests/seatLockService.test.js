import test from 'node:test';
import assert from 'node:assert/strict';
import {
  __resetSeatLocksForTests,
  getLockedSeatsByOthers,
  getTotalLockedSeats,
  lockSeats,
  releaseSeats
} from '../services/seatLockService.js';

test('locks seats and reports effective availability', () => {
  __resetSeatLocksForTests();

  const result = lockSeats({ eventId: 1, socketId: 's1', quantity: 2, availableSeats: 10 });

  assert.equal(result.ok, true);
  assert.equal(result.lockedSeats, 2);
  assert.equal(result.effectiveAvailableSeats, 8);
  assert.equal(getTotalLockedSeats(1), 2);
});

test('prevents over-locking when others already hold seats', () => {
  __resetSeatLocksForTests();

  lockSeats({ eventId: 2, socketId: 's1', quantity: 6, availableSeats: 10 });
  const result = lockSeats({ eventId: 2, socketId: 's2', quantity: 5, availableSeats: 10 });

  assert.equal(result.ok, false);
  assert.match(result.message, /temporarily locked/i);
  assert.equal(getLockedSeatsByOthers(2, 's2'), 6);
});

test('releaseSeats removes lock for current socket only', () => {
  __resetSeatLocksForTests();

  lockSeats({ eventId: 3, socketId: 's1', quantity: 2, availableSeats: 10 });
  lockSeats({ eventId: 3, socketId: 's2', quantity: 3, availableSeats: 10 });

  const release = releaseSeats({ eventId: 3, socketId: 's1', availableSeats: 10 });

  assert.equal(release.lockedSeats, 3);
  assert.equal(release.effectiveAvailableSeats, 7);
  assert.equal(getTotalLockedSeats(3), 3);
});
