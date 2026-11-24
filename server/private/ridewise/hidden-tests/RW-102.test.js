import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cancellationFee } from '../../src/services/fareService.js';
import { createTestServices, bookRide, T0, seconds } from '../helpers.js';

test('[acceptance] cancelling exactly 120 seconds after acceptance is free', () => {
  assert.equal(cancellationFee({ acceptedAt: T0, cancelledAt: T0 + seconds(120) }), 0);
});

test('[acceptance] cancelling after the 120 second window is charged', () => {
  assert.equal(cancellationFee({ acceptedAt: T0, cancelledAt: T0 + seconds(121) }), 5000);
  assert.equal(cancellationFee({ acceptedAt: T0, cancelledAt: T0 + seconds(120) + 1 }), 5000);
});

test('[acceptance] a ride cancelled at the edge of the window carries no fee', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  s.rideService.acceptRide(ride.id, { at: T0 });
  s.rideService.cancelRide(ride.id, { at: T0 + seconds(120) });
  assert.equal(ride.cancellationFeeInPaise, 0);
});
