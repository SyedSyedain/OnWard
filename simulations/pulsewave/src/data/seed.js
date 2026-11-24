/**
 * Sample catalogue used when the app starts.
 * @module data/seed
 */

/**
 * Builds a fresh copy of the sample catalogue.
 * @returns {{ tracks: object[], playlists: object[] }}
 */
export function createSeed() {
  return {
    tracks: [
      { id: 't-1', title: 'Neon Skyline', artist: 'Aurora Vale', durationSec: 185, liked: false },
      { id: 't-2', title: 'Rock & Roll Machine', artist: 'The Static Bloom', durationSec: 242, liked: false },
      { id: 't-3', title: 'Midnight Tram', artist: 'Aurora Vale', durationSec: 200, liked: false },
      { id: 't-4', title: 'Paper Lanterns', artist: 'Kite Season', durationSec: 167, liked: false },
      { id: 't-5', title: 'Daybreak <Remix>', artist: 'Kite Season', durationSec: 309, liked: false },
      { id: 't-6', title: 'Low Tide', artist: 'Marlowe Park', durationSec: 221, liked: false },
      { id: 't-7', title: 'Static Hearts', artist: 'The Static Bloom', durationSec: 198, liked: false },
      { id: 't-8', title: 'Cartwheel', artist: 'Marlowe Park', durationSec: 254, liked: false },
    ],
    playlists: [
      { id: 'pl-1', name: 'Morning Drive', trackIds: ['t-1', 't-2', 't-4', 't-6'] },
      { id: 'pl-2', name: 'Late Night', trackIds: ['t-3', 't-5', 't-7', 't-8'] },
    ],
  };
}
