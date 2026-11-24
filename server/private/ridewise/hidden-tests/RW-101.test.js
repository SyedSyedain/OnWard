import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices, bookRide, T0, seconds } from '../helpers.js';
import { ConflictError } from '../../src/lib/errors.js';

function completedRide(services) {
  const ride = bookRide(services);
  services.rideService.acceptRide(ride.id, { at: T0 });
  services.rideService.startRide(ride.id, { at: T0 + seconds(60) });
  services.rideService.completeRide(ride.id, { at: T0 + seconds(900) });
  return ride;
}

test('[acceptance] cancelling a completed ride is rejected with a ConflictError', () => {
  const s = createTestServices();
  const ride = completedRide(s);
  assert.throws(() => s.rideService.cancelRide(ride.id, { at: T0 + seconds(1200) }), ConflictError);
});

test('[acceptance] a rejected cancellation leaves the completed ride untouched', () => {
  const s = createTestServices();
  const ride = completedRide(s);
  assert.throws(() => s.rideService.cancelRide(ride.id, { at: T0 + seconds(1200) }));
  const stored = s.rideService.getRide(ride.id);
  assert.equal(stored.status, 'completed');
  assert.equal(stored.cancelledAt, null);
  assert.equal(stored.cancellationFeeInPaise, 0);
});

test('[acceptance] requested and accepted rides can still be cancelled', () => {
  const s = createTestServices();
  const first = bookRide(s);
  assert.equal(s.rideService.cancelRide(first.id, { at: T0 }).status, 'cancelled');
  const second = bookRide(s, { riderId: 'rider-2' });
  s.rideService.acceptRide(second.id, { at: T0 });
  assert.equal(s.rideService.cancelRide(second.id, { at: T0 + seconds(30) }).status, 'cancelled');
});
