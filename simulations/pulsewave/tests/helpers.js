/**
 * Builds fresh, isolated state for each test.
 */

import { createStore } from '../src/state/store.js';
import { createAppReducer, createInitialState } from '../src/state/reducer.js';

export function defaultSeed() {
  return {
    tracks: [
      { id: 't-1', title: 'Neon Skyline', artist: 'Aurora Vale', durationSec: 185, liked: false },
      { id: 't-2', title: 'Rock & Roll Machine', artist: 'The Static Bloom', durationSec: 242, liked: false },
      { id: 't-3', title: 'Midnight Tram', artist: 'Aurora Vale', durationSec: 200, liked: false },
      { id: 't-4', title: 'Daybreak <Remix>', artist: 'Kite Season', durationSec: 309, liked: false },
    ],
    playlists: [
      { id: 'pl-1', name: 'Morning Drive', trackIds: ['t-1', 't-2', 't-4'] },
      { id: 'pl-2', name: 'Late Night', trackIds: ['t-3'] },
    ],
  };
}

export function createTestStore(seed = defaultSeed()) {
  return createStore(createInitialState(seed), createAppReducer(seed));
}

export function track(overrides = {}) {
  return { id: 't-x', title: 'Test Song', artist: 'Test Artist', durationSec: 180, liked: false, ...overrides };
}
