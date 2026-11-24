import { test } from 'node:test';
import assert from 'node:assert/strict';
import { track } from '../helpers.js';
import { nowPlayingBar } from '../../src/components/nowPlayingBar.js';

const bar = (isPlaying) => nowPlayingBar({ track: track(), isPlaying, shuffle: false, repeat: 'off' });
const toggleButton = (html) => html.match(/<button[^>]*data-action="toggle-play"[^>]*>/)[0];

test('[acceptance] the play button is labelled "Play" while paused', () => {
  assert.match(toggleButton(bar(false)), /aria-label="Play"/);
});

test('[acceptance] the play button is labelled "Pause" while playing', () => {
  assert.match(toggleButton(bar(true)), /aria-label="Pause"/);
});

test('[acceptance] the bar still shows the track and its other labelled controls', () => {
  const html = bar(true);
  assert.ok(html.includes('Test Song'));
  assert.ok(html.includes('aria-label="Previous track"'));
  assert.ok(html.includes('aria-label="Next track"'));
  assert.match(toggleButton(html), /data-action="toggle-play"/);
});
