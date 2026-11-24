import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateFare, cancellationFee } from '../src/services/fareService.js';
import { ValidationError } from '../src/lib/errors.js';
import { T0, seconds } from './helpers.js';

test('fare adds base, distance and time charges', () => {
  const fare = estimateFare({ distanceKm: 10, durationMinutes: 20 });
  assert.equal(fare.distanceFareInPaise, 12000);
  assert.equal(fare.timeFareInPaise, 3000);
  assert.equal(fare.totalInPaise, 20000);
});

test('a surge multiplier of 1 leaves the fare unchanged', () => {
  assert.equal(estimateFare({ distanceKm: 10, durationMinutes: 20, surgeMultiplier: 1 }).totalInPaise, 20000);
});

test('short trips are charged the minimum fare', () => {
  assert.equal(estimateFare({ distanceKm: 0.2, durationMinutes: 1 }).totalInPaise, 8000);
});

test('invalid trip input is rejected', () => {
  assert.throws(() => estimateFare({ distanceKm: -1, durationMinutes: 5 }), ValidationError);
  assert.throws(() => estimateFare({ distanceKm: 1, durationMinutes: 5, surgeMultiplier: 0.5 }), ValidationError);
});

test('cancelling before a driver accepts is free', () => {
  assert.equal(cancellationFee({ acceptedAt: null, cancelledAt: T0 }), 0);
});

test('cancelling well after acceptance is charged, early is free', () => {
  assert.equal(cancellationFee({ acceptedAt: T0, cancelledAt: T0 + seconds(30) }), 0);
  assert.equal(cancellationFee({ acceptedAt: T0, cancelledAt: T0 + seconds(300) }), 5000);
});
