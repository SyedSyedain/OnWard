import { test } from 'node:test';
import assert from 'node:assert/strict';
import { track, createTestStore } from './helpers.js';
import { trackRow } from '../src/components/trackRow.js';
import { playlistView } from '../src/components/playlistView.js';
import { queuePanel } from '../src/components/queuePanel.js';
import { nowPlayingBar } from '../src/components/nowPlayingBar.js';
import { searchBox } from '../src/components/searchBox.js';
import { renderApp } from '../src/app.js';

test('trackRow escapes titles and artists', () => {
  const html = trackRow({ track: track({ title: 'Daybreak <Remix> & More', artist: 'A "B"' }) });
  assert.ok(html.includes('Daybreak &lt;Remix&gt; &amp; More'));
  assert.ok(!html.includes('<Remix>'));
  assert.ok(html.includes('A &quot;B&quot;'));
});

test('trackRow like button reflects the liked state', () => {
  assert.match(trackRow({ track: track({ liked: true }) }), /aria-pressed="true"[^>]*aria-label="Unlike Test Song"/);
  assert.match(trackRow({ track: track() }), /aria-pressed="false"[^>]*aria-label="Like Test Song"/);
});

test('playlistView shows the summary and rows, or an empty message', () => {
  const playlist = { id: 'pl-1', name: 'Mix & Match', trackIds: ['a', 'b'] };
  const html = playlistView({ playlist, tracks: [track({ id: 'a' })], totalSeconds: 815, currentId: 'a' });
  assert.ok(html.includes('Mix &amp; Match'));
  assert.ok(html.includes('2 tracks, 13 min'));
  assert.ok(html.includes('is-current'));
  assert.ok(playlistView({ playlist, tracks: [], totalSeconds: 0, currentId: null }).includes('No tracks match'));
});

test('queuePanel lists tracks with remove buttons, or an empty message', () => {
  const html = queuePanel({ tracks: [track({ title: 'One' })] });
  assert.ok(html.includes('aria-label="Remove One from queue"'));
  assert.ok(queuePanel({ tracks: [] }).includes('Your queue is empty.'));
});

test('nowPlayingBar shows the track and labelled navigation buttons', () => {
  const html = nowPlayingBar({ track: track({ title: 'A & B' }), isPlaying: true, shuffle: false, repeat: 'off' });
  assert.ok(html.includes('A &amp; B'));
  assert.ok(html.includes('aria-label="Previous track"'));
  assert.ok(html.includes('aria-label="Next track"'));
  assert.match(html, /data-action="toggle-play"/);
  assert.ok(nowPlayingBar({ isPlaying: false, shuffle: false, repeat: 'off' }).includes('Pick a track'));
});

test('searchBox keeps the typed text safely', () => {
  assert.ok(searchBox({ query: '"><script>' }).includes('value="&quot;&gt;&lt;script&gt;"'));
});

test('renderApp composes the page from state', () => {
  const html = renderApp(createTestStore().getState());
  assert.ok(html.includes('Morning Drive'));
  assert.ok(html.includes('Neon Skyline'));
  assert.ok(html.includes('Your queue is empty.'));
});
