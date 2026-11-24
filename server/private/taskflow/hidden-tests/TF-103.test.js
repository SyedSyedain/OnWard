import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getDueStatus } from '../../src/lib/dates.js';
import { renderCard } from '../../src/components/card.js';
import { makeCard } from '../helpers.js';

test('[acceptance] a card due today is not overdue, whatever the time of day', () => {
  assert.notEqual(getDueStatus('2026-11-24', new Date(2026, 10, 24, 15, 30, 0)), 'overdue');
  assert.notEqual(getDueStatus('2026-11-24', new Date(2026, 10, 24, 23, 59, 59)), 'overdue');
  assert.equal(getDueStatus('2026-11-24', new Date(2026, 10, 24, 15, 30, 0)), 'soon');
});

test('[acceptance] a card due today shows the due-soon badge, not the overdue badge', () => {
  const html = renderCard(makeCard({ dueDate: '2026-11-24' }), new Date(2026, 10, 24, 18, 0, 0));
  assert.match(html, /badge-soon/);
  assert.doesNotMatch(html, /badge-overdue/);
});

test('[acceptance] yesterday is overdue and later dates keep their status', () => {
  const now = new Date(2026, 10, 24, 0, 5, 0);
  assert.equal(getDueStatus('2026-11-23', now), 'overdue');
  assert.equal(getDueStatus('2026-11-26', now), 'soon');
  assert.equal(getDueStatus('2026-11-27', now), 'later');
});
