import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateScore } from '../src/services/scoring.service.js';

test('a clean, independent, resolved solution scores 100', () => {
  const score = calculateScore({ resolved: true, qualityScore: 25, hintLevel: 0 });
  assert.deepEqual(score, { correctness: 60, quality: 25, independence: 15, total: 100 });
});

test('an unresolved ticket earns only the quality score', () => {
  const score = calculateScore({ resolved: false, qualityScore: 10, hintLevel: 0 });
  assert.deepEqual(score, { correctness: 0, quality: 10, independence: 0, total: 10 });
});

test('each hint level reduces independence', () => {
  const levels = [0, 1, 2, 3, 4].map(
    (hintLevel) => calculateScore({ resolved: true, qualityScore: 0, hintLevel }).independence,
  );
  assert.deepEqual(levels, [15, 12, 8, 4, 0]);
});

test('out-of-range quality scores are clamped', () => {
  assert.equal(calculateScore({ resolved: true, qualityScore: 99, hintLevel: 0 }).quality, 25);
  assert.equal(calculateScore({ resolved: true, qualityScore: -3, hintLevel: 0 }).quality, 0);
});
