import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateFare } from '../../src/services/fareService.js';

test('[acceptance] surge multiplies the whole fare, not only the base fare', () => {
  const fare = estimateFare({ distanceKm: 10, durationMinutes: 20, surgeMultiplier: 1.5 });
  assert.equal(fare.totalInPaise, 30000);
});

test('[acceptance] a surged short trip is priced on base, distance and time together', () => {
  const fare = estimateFare({ distanceKm: 0.2, durationMinutes: 1, surgeMultiplier: 2 });
  assert.equal(fare.totalInPaise, 10780);
});

test('[acceptance] fares without surge and the minimum fare are unchanged', () => {
  assert.equal(estimateFare({ distanceKm: 10, durationMinutes: 20 }).totalInPaise, 20000);
  assert.equal(estimateFare({ distanceKm: 0.1, durationMinutes: 1 }).totalInPaise, 8000);
});
