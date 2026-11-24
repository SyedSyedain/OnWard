import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestStore } from '../helpers.js';
import { filterTracks, selectVisibleTracks } from '../../src/state/selectors.js';

const ids = (tracks) => tracks.map((t) => t.id);

test('[acceptance] searching ignores case when matching titles', () => {
  const store = createTestStore();
  store.dispatch({ type: 'library/search', query: 'neon skyline' });
  assert.deepEqual(ids(selectVisibleTracks(store.getState())), ['t-1']);
  store.dispatch({ type: 'library/search', query: 'ROCK & ROLL' });
  assert.deepEqual(ids(selectVisibleTracks(store.getState())), ['t-2']);
});

test('[acceptance] searching ignores case when matching artists', () => {
  const store = createTestStore();
  store.dispatch({ type: 'library/search', query: 'aurora' });
  assert.deepEqual(ids(selectVisibleTracks(store.getState())), ['t-1']);
  store.dispatch({ type: 'library/search', query: 'kITE sEASON' });
  assert.deepEqual(ids(selectVisibleTracks(store.getState())), ['t-4']);
});

test('[acceptance] empty, padded and non-matching searches behave as before', () => {
  const store = createTestStore();
  store.dispatch({ type: 'library/search', query: '   ' });
  assert.equal(selectVisibleTracks(store.getState()).length, 3);
  store.dispatch({ type: 'library/search', query: '  Neon ' });
  assert.deepEqual(ids(selectVisibleTracks(store.getState())), ['t-1']);
  assert.deepEqual(filterTracks(store.getState().tracks, 'zzz'), []);
});
