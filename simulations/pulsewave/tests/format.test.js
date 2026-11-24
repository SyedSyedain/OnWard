import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDuration, formatTotalDuration } from '../src/lib/format.js';
import { shuffle } from '../src/lib/shuffle.js';
import { escapeHtml } from '../src/lib/html.js';

test('formatDuration shows minutes and two-digit seconds', () => {
  assert.equal(formatDuration(754), '12:34');
  assert.equal(formatDuration(3599), '59:59');
  assert.equal(formatDuration(90), '1:30');
});

test('formatDuration treats invalid input as zero', () => {
  assert.equal(formatDuration(NaN), '0:00');
  assert.equal(formatDuration(-4), '0:00');
});

test('formatTotalDuration uses minutes, and hours when needed', () => {
  assert.equal(formatTotalDuration(815), '13 min');
  assert.equal(formatTotalDuration(3900), '1 hr 5 min');
  assert.equal(formatTotalDuration(0), '0 min');
});

test('shuffle returns a permutation and leaves the input alone', () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input, () => 0);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
  assert.deepEqual([...out].sort(), [1, 2, 3, 4, 5]);
});

test('escapeHtml escapes markup characters', () => {
  assert.equal(escapeHtml('<b>&"\''), '&lt;b&gt;&amp;&quot;&#39;');
  assert.equal(escapeHtml(null), '');
});
