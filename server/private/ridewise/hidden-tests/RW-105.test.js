import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices, bookRide, T0, seconds, CENTER, FAR } from '../helpers.js';
import { ConflictError } from '../../src/lib/errors.js';

const oneDriver = () => [{ id: 'd-1', name: 'Asha', status: 'available', location: CENTER }];

test('[acceptance] cancelling an accepted ride makes the driver available again', () => {
  const s = createTestServices({ drivers: oneDriver() });
  const first = bookRide(s);
  s.rideService.acceptRide(first.id, { at: T0 });
  s.rideService.cancelRide(first.id, { at: T0 + seconds(30) });
  assert.equal(s.driverService.getDriver('d-1').status, 'available');
  const second = bookRide(s, { riderId: 'rider-2' });
  assert.equal(s.rideService.acceptRide(second.id, { at: T0 + seconds(60) }).driverId, 'd-1');
});

test('[acceptance] after a completed ride the driver is at the drop-off point', () => {
  const dropoff = { lat: 13.04, lng: 77.597 };
  const s = createTestServices({
    drivers: [
      { id: 'd-a', name: 'Asha', status: 'available', location: CENTER },
      { id: 'd-b', name: 'Imran', status: 'available', location: FAR },
    ],
  });
  const first = bookRide(s, { dropoff });
  s.rideService.acceptRide(first.id, { at: T0 });
  s.rideService.startRide(first.id, { at: T0 + seconds(60) });
  s.rideService.completeRide(first.id, { at: T0 + seconds(900) });
  assert.deepEqual(s.driverService.getDriver('d-a').location, dropoff);
  const second = bookRide(s, { riderId: 'rider-2', pickup: dropoff, dropoff: CENTER });
  assert.equal(s.rideService.acceptRide(second.id, { at: T0 + seconds(1000) }).driverId, 'd-a');
});

test('[acceptance] a driver on an active ride is not matched to another ride', () => {
  const s = createTestServices({ drivers: oneDriver() });
  const first = bookRide(s);
  s.rideService.acceptRide(first.id, { at: T0 });
  const second = bookRide(s, { riderId: 'rider-2' });
  assert.throws(() => s.rideService.acceptRide(second.id, { at: T0 }), ConflictError);
  s.rideService.cancelRide(first.id, { at: T0 + seconds(10) });
  assert.doesNotThrow(() => s.rideService.acceptRide(second.id, { at: T0 + seconds(20) }));
});
