import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestStore } from './helpers.js';
import {
  selectLikedTracks,
  selectNowPlaying,
  selectPlaylistDuration,
  selectQueueTracks,
  selectVisibleTracks,
} from '../src/state/selectors.js';

test('the first playlist is open and lists its tracks in order', () => {
  const store = createTestStore();
  assert.deepEqual(selectVisibleTracks(store.getState()).map((t) => t.id), ['t-1', 't-2', 't-4']);
});

test('searching with matching case filters by title or artist; empty search shows all', () => {
  const store = createTestStore();
  store.dispatch({ type: 'library/search', query: 'Neon' });
  assert.deepEqual(selectVisibleTracks(store.getState()).map((t) => t.id), ['t-1']);
  store.dispatch({ type: 'library/search', query: 'Kite' });
  assert.deepEqual(selectVisibleTracks(store.getState()).map((t) => t.id), ['t-4']);
  store.dispatch({ type: 'library/search', query: '' });
  assert.equal(selectVisibleTracks(store.getState()).length, 3);
});

test('playlist duration adds up every track', () => {
  const store = createTestStore();
  assert.equal(selectPlaylistDuration(store.getState()), 185 + 242 + 309);
});

test('queue add appends, remove and clear work', () => {
  const store = createTestStore();
  store.dispatch({ type: 'queue/add', trackId: 't-1' });
  store.dispatch({ type: 'queue/add', trackId: 't-2' });
  store.dispatch({ type: 'queue/add', trackId: 't-3' });
  assert.deepEqual(store.getState().queue, ['t-1', 't-2', 't-3']);
  store.dispatch({ type: 'queue/remove', index: 1 });
  assert.deepEqual(selectQueueTracks(store.getState()).map((t) => t.id), ['t-1', 't-3']);
  store.dispatch({ type: 'queue/clear' });
  assert.deepEqual(store.getState().queue, []);
});

test('playing a track and moving next consumes the queue', () => {
  const store = createTestStore();
  store.dispatch({ type: 'player/play', trackId: 't-1' });
  store.dispatch({ type: 'queue/add', trackId: 't-3' });
  store.dispatch({ type: 'player/next' });
  assert.equal(selectNowPlaying(store.getState()).id, 't-3');
  assert.deepEqual(store.getState().queue, []);
  store.dispatch({ type: 'player/next' });
  assert.equal(store.getState().isPlaying, false);
});

test('toggle, repeat and shuffle controls change playback settings', () => {
  const store = createTestStore();
  store.dispatch({ type: 'player/toggle' });
  assert.equal(store.getState().isPlaying, false);
  store.dispatch({ type: 'player/play', trackId: 't-1' });
  store.dispatch({ type: 'player/toggle' });
  assert.equal(store.getState().isPlaying, false);
  store.dispatch({ type: 'player/cycleRepeat' });
  assert.equal(store.getState().repeat, 'all');
  store.dispatch({ type: 'player/toggleShuffle' });
  assert.equal(store.getState().shuffle, true);
});

test('queue shuffle keeps the same tracks', () => {
  const store = createTestStore();
  ['t-1', 't-2', 't-3'].forEach((trackId) => store.dispatch({ type: 'queue/add', trackId }));
  store.dispatch({ type: 'queue/shuffle', random: () => 0.5 });
  assert.deepEqual([...store.getState().queue].sort(), ['t-1', 't-2', 't-3']);
});

test('liking a track shows it in the liked songs, and subscribers are notified', () => {
  const store = createTestStore();
  let calls = 0;
  store.subscribe(() => calls++);
  store.dispatch({ type: 'track/toggleLike', trackId: 't-2' });
  assert.deepEqual(selectLikedTracks(store.getState()).map((t) => t.id), ['t-2']);
  assert.equal(calls, 1);
});
