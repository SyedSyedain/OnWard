import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterListings, sortListings, paginate } from '../src/state/selectors.js';
import { makeListings } from './helpers.js';

const ids = (list) => list.map((l) => l.id);

test('no filters returns every listing', () => {
  assert.deepEqual(ids(filterListings(makeListings(), {})), ['a', 'b', 'c']);
});

test('query matches title or city, ignoring case', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { query: 'goa' })), ['a', 'c']);
  assert.deepEqual(ids(filterListings(makeListings(), { query: 'BRAVO' })), ['b']);
});

test('price range filters out listings clearly outside it', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { minPrice: 600, maxPrice: 1000 })), ['b']);
  assert.deepEqual(ids(filterListings(makeListings(), { maxPrice: 700 })), ['a']);
});

test('guest filter keeps listings that sleep enough people', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { guests: 5 })), ['c']);
});

test('a single amenity filter keeps listings that have it', () => {
  assert.deepEqual(ids(filterListings(makeListings(), { amenities: ['pool'] })), ['a', 'c']);
});

test('sortListings sorts a copy and leaves the input alone', () => {
  const input = makeListings();
  assert.deepEqual(ids(sortListings(input, 'price-desc')), ['c', 'b', 'a']);
  assert.deepEqual(ids(sortListings(input, 'price-asc')), ['a', 'b', 'c']);
  assert.deepEqual(ids(input), ['a', 'b', 'c']);
});

test('paginate slices pages and clamps the page number', () => {
  const items = [1, 2, 3, 4, 5];
  assert.deepEqual(paginate(items, 1, 2), { items: [1, 2], page: 1, totalPages: 3 });
  assert.deepEqual(paginate(items, 3, 2), { items: [5], page: 3, totalPages: 3 });
  assert.equal(paginate(items, 99, 2).page, 3);
  assert.deepEqual(paginate([], 1, 2), { items: [], page: 1, totalPages: 1 });
});
