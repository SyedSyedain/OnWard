import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestStore } from '../helpers.js';
import { selectNowPlaying } from '../../src/state/selectors.js';

test('[acceptance] "play next" puts the track at the front of the queue', () => {
  const store = createTestStore();
  store.dispatch({ type: 'queue/add', trackId: 't-1' });
  store.dispatch({ type: 'queue/add', trackId: 't-2' });
  store.dispatch({ type: 'queue/playNext', trackId: 't-3' });
  assert.deepEqual(store.getState().queue, ['t-3', 't-1', 't-2']);
});

test('[acceptance] the "play next" track is the one that plays after the current track', () => {
  const store = createTestStore();
  store.dispatch({ type: 'player/play', trackId: 't-1' });
  store.dispatch({ type: 'queue/add', trackId: 't-2' });
  store.dispatch({ type: 'queue/playNext', trackId: 't-4' });
  store.dispatch({ type: 'player/next' });
  assert.equal(selectNowPlaying(store.getState()).id, 't-4');
  assert.deepEqual(store.getState().queue, ['t-2']);
});

test('[acceptance] adding to an empty queue and adding to the end still work', () => {
  const store = createTestStore();
  store.dispatch({ type: 'queue/playNext', trackId: 't-1' });
  assert.deepEqual(store.getState().queue, ['t-1']);
  store.dispatch({ type: 'queue/add', trackId: 't-2' });
  store.dispatch({ type: 'queue/add', trackId: 't-3' });
  assert.deepEqual(store.getState().queue, ['t-1', 't-2', 't-3']);
});
