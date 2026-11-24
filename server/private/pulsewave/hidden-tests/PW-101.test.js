import { test } from 'node:test';
import assert from 'node:assert/strict';
import { track, defaultSeed, createTestStore } from '../helpers.js';
import { formatDuration, formatTotalDuration } from '../../src/lib/format.js';
import { trackRow } from '../../src/components/trackRow.js';
import { renderApp } from '../../src/app.js';

test('[acceptance] seconds below ten are padded with a leading zero', () => {
  assert.equal(formatDuration(185), '3:05');
  assert.equal(formatDuration(61), '1:01');
  assert.equal(formatDuration(0), '0:00');
});

test('[acceptance] whole minutes show two zeros and rows use the padded format', () => {
  assert.equal(formatDuration(180), '3:00');
  assert.equal(formatDuration(600), '10:00');
  assert.match(trackRow({ track: track({ durationSec: 185 }) }), /<span class="track-duration">3:05<\/span>/);
  const seed = defaultSeed();
  const html = renderApp(createTestStore(seed).getState());
  assert.ok(html.includes('>3:05<'));
});

test('[acceptance] durations with two-digit seconds and playlist totals are unchanged', () => {
  assert.equal(formatDuration(754), '12:34');
  assert.equal(formatDuration(3599), '59:59');
  assert.equal(formatTotalDuration(3900), '1 hr 5 min');
});
