import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestStore, defaultSeed } from '../helpers.js';
import { selectLikedTracks, selectTrackById } from '../../src/state/selectors.js';

test('[acceptance] liking a track does not change the previous state or the catalogue it came from', () => {
  const seed = defaultSeed();
  const store = createTestStore(seed);
  const before = store.getState();
  store.dispatch({ type: 'track/toggleLike', trackId: 't-1' });
  assert.equal(selectTrackById(before, 't-1').liked, false);
  assert.equal(seed.tracks.find((t) => t.id === 't-1').liked, false);
  assert.equal(selectTrackById(store.getState(), 't-1').liked, true);
});

test('[acceptance] resetting the session clears likes', () => {
  const store = createTestStore();
  store.dispatch({ type: 'track/toggleLike', trackId: 't-2' });
  store.dispatch({ type: 'track/toggleLike', trackId: 't-3' });
  store.dispatch({ type: 'session/reset' });
  assert.deepEqual(selectLikedTracks(store.getState()), []);
});

test('[acceptance] liking and unliking still updates only the chosen track', () => {
  const store = createTestStore();
  store.dispatch({ type: 'track/toggleLike', trackId: 't-2' });
  store.dispatch({ type: 'track/toggleLike', trackId: 't-4' });
  assert.deepEqual(selectLikedTracks(store.getState()).map((t) => t.id), ['t-2', 't-4']);
  store.dispatch({ type: 'track/toggleLike', trackId: 't-2' });
  assert.deepEqual(selectLikedTracks(store.getState()).map((t) => t.id), ['t-4']);
  const missing = store.dispatch({ type: 'track/toggleLike', trackId: 'nope' });
  assert.equal(missing, store.getState());
});
