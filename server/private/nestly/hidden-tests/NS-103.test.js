import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeListings } from '../helpers.js';
import { filterListings } from '../../src/state/selectors.js';

const ids = (list) => list.map((l) => l.id);

test('[acceptance] selecting two amenities returns only listings that have both', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { amenities: ['pool', 'kitchen'] })), ['c']);
});

test('[acceptance] selecting amenities that no listing has all of returns nothing', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { amenities: ['pool', 'parking'] })), []);
});

test('[acceptance] a single amenity or no amenities behaves as before', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { amenities: ['kitchen'] })), ['b', 'c']);
  assert.deepEqual(ids(filterListings(makeListings(), { amenities: [] })), ['a', 'b', 'c']);
});
