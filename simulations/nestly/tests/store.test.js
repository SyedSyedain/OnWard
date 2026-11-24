import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/lib/store.js';
import { createInitialState, reducer } from '../src/state/reducer.js';

test('dispatch updates state and notifies subscribers', () => {
  const store = createStore(createInitialState(), reducer);
  const seen = [];
  store.subscribe((s) => seen.push(s.selectedId));
  store.dispatch({ type: 'listing/select', id: 'x' });
  assert.deepEqual(seen, ['x']);
  assert.equal(store.getState().selectedId, 'x');
});

test('unsubscribe stops notifications and unknown actions are ignored', () => {
  const store = createStore(createInitialState(), reducer);
  let calls = 0;
  const off = store.subscribe(() => calls++);
  store.dispatch({ type: 'nope' });
  assert.equal(calls, 0);
  off();
  store.dispatch({ type: 'listing/select', id: 'y' });
  assert.equal(calls, 0);
});

test('filters/set merges changes and resets the page', () => {
  const state = { ...createInitialState(), page: 3 };
  const next = reducer(state, { type: 'filters/set', changes: { query: 'goa' } });
  assert.equal(next.filters.query, 'goa');
  assert.equal(next.filters.guests, 1);
  assert.equal(next.page, 1);
  assert.equal(state.filters.query, '');
});

test('stay/set merges dates', () => {
  const next = reducer(createInitialState(), { type: 'stay/set', changes: { checkIn: '2026-03-10' } });
  assert.equal(next.stay.checkIn, '2026-03-10');
  assert.equal(next.stay.guests, 1);
});

test('favourites/toggle adds and removes an id', () => {
  const added = reducer(createInitialState(), { type: 'favourites/toggle', id: 'a' });
  assert.deepEqual(added.favourites, ['a']);
  const removed = reducer(added, { type: 'favourites/toggle', id: 'a' });
  assert.deepEqual(removed.favourites, []);
});
