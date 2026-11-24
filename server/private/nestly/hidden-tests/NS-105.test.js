import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeListings } from '../helpers.js';
import { createStore } from '../../src/lib/store.js';
import { createInitialState, reducer } from '../../src/state/reducer.js';
import { selectFavouriteListings } from '../../src/state/selectors.js';

test('[acceptance] toggling a favourite does not modify the previous state', () => {
  const before = createInitialState();
  const added = reducer(before, { type: 'favourites/toggle', id: 'a' });
  assert.deepEqual(before.favourites, []);
  assert.deepEqual(added.favourites, ['a']);
  const removed = reducer(added, { type: 'favourites/toggle', id: 'a' });
  assert.deepEqual(added.favourites, ['a']);
  assert.deepEqual(removed.favourites, []);
  assert.notEqual(added.favourites, before.favourites);
});

test('[acceptance] the favourites list shown to the guest updates after every toggle', () => {
  const listings = makeListings();
  const store = createStore(createInitialState(), reducer);
  assert.deepEqual(selectFavouriteListings(store.getState(), listings), []);
  store.dispatch({ type: 'favourites/toggle', id: 'b' });
  assert.deepEqual(selectFavouriteListings(store.getState(), listings).map((l) => l.id), ['b']);
  store.dispatch({ type: 'favourites/toggle', id: 'c' });
  assert.deepEqual(selectFavouriteListings(store.getState(), listings).map((l) => l.id), ['b', 'c']);
  store.dispatch({ type: 'favourites/toggle', id: 'b' });
  assert.deepEqual(selectFavouriteListings(store.getState(), listings).map((l) => l.id), ['c']);
});

test('[acceptance] other state is preserved and subscribers are notified on each toggle', () => {
  const store = createStore(createInitialState(), reducer);
  store.dispatch({ type: 'filters/set', changes: { query: 'goa' } });
  let calls = 0;
  store.subscribe(() => calls++);
  store.dispatch({ type: 'favourites/toggle', id: 'a' });
  store.dispatch({ type: 'favourites/toggle', id: 'a' });
  assert.equal(calls, 2);
  assert.equal(store.getState().filters.query, 'goa');
});
