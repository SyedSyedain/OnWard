import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ConflictError, NotFoundError, ValidationError } from '../src/lib/errors.js';
import { createTestServices, bookRide, T0, seconds, CENTER } from './helpers.js';

test('a new ride starts in the requested status with a fare', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  assert.equal(ride.status, 'requested');
  assert.equal(ride.driverId, null);
  assert.ok(ride.fareInPaise >= 8000);
});

test('booking requires valid coordinates and a rider', () => {
  const s = createTestServices();
  assert.throws(() => bookRide(s, { pickup: { lat: 200, lng: 0 } }), ValidationError);
  assert.throws(() => bookRide(s, { riderId: '' }), ValidationError);
});

test('accepting a ride assigns the nearest available driver and marks them busy', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  s.rideService.acceptRide(ride.id, { at: T0 });
  assert.equal(ride.status, 'accepted');
  assert.equal(ride.driverId, 'd-near');
  assert.equal(s.driverService.getDriver('d-near').status, 'busy');
});

test('busy drivers are never matched', () => {
  const s = createTestServices();
  const driver = s.driverService.findNearestAvailable(CENTER);
  assert.equal(driver.id, 'd-near');
  s.driverService.markBusy('d-near');
  assert.equal(s.driverService.findNearestAvailable(CENTER).id, 'd-far');
});

test('accepting fails when no driver is available', () => {
  const s = createTestServices({ drivers: [] });
  const ride = bookRide(s);
  assert.throws(() => s.rideService.acceptRide(ride.id, { at: T0 }), ConflictError);
});

test('a ride moves through accepted, started and completed in order', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  assert.throws(() => s.rideService.startRide(ride.id, { at: T0 }), ConflictError);
  s.rideService.acceptRide(ride.id, { at: T0 });
  s.rideService.startRide(ride.id, { at: T0 + seconds(200) });
  s.rideService.completeRide(ride.id, { at: T0 + seconds(900) });
  assert.equal(ride.status, 'completed');
  assert.equal(s.driverService.getDriver('d-near').status, 'available');
  assert.throws(() => s.rideService.startRide(ride.id, { at: T0 }), ConflictError);
});

test('unknown rides throw NotFoundError', () => {
  const s = createTestServices();
  assert.throws(() => s.rideService.getRide('nope'), NotFoundError);
});

test('cancelling a requested ride is free', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  s.rideService.cancelRide(ride.id, { at: T0 + seconds(600) });
  assert.equal(ride.status, 'cancelled');
  assert.equal(ride.cancellationFeeInPaise, 0);
});

test('a ride cannot be cancelled twice', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  s.rideService.cancelRide(ride.id, { at: T0 });
  assert.throws(() => s.rideService.cancelRide(ride.id, { at: T0 }), ConflictError);
});

test('cancelling long after acceptance charges the fee', () => {
  const s = createTestServices();
  const ride = bookRide(s);
  s.rideService.acceptRide(ride.id, { at: T0 });
  s.rideService.cancelRide(ride.id, { at: T0 + seconds(600) });
  assert.equal(ride.cancellationFeeInPaise, 5000);
});
