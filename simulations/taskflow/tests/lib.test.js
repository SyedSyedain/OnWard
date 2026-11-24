import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../src/lib/html.js';
import { formatDueDate, getDueStatus } from '../src/lib/dates.js';
import { validateCardInput } from '../src/lib/validation.js';
import { getShortcutAction } from '../src/lib/shortcuts.js';
import { NOW } from './helpers.js';

test('escapeHtml escapes markup characters', () => {
  assert.equal(escapeHtml('<b>"A" & \'B\'</b>'), '&lt;b&gt;&quot;A&quot; &amp; &#39;B&#39;&lt;/b&gt;');
});

test('getDueStatus handles missing, past, upcoming and distant dates', () => {
  assert.equal(getDueStatus('', NOW), 'none');
  assert.equal(getDueStatus('2026-11-20', NOW), 'overdue');
  assert.equal(getDueStatus('2026-11-26', NOW), 'soon');
  assert.equal(getDueStatus('2026-12-15', NOW), 'later');
});

test('formatDueDate prints a short month and day', () => {
  assert.equal(formatDueDate('2026-03-05'), 'Mar 5');
});

test('validateCardInput requires a title and limits its length', () => {
  assert.equal(validateCardInput({ title: '' }).valid, false);
  assert.equal(validateCardInput({ title: 'x'.repeat(81) }).valid, false);
  assert.equal(validateCardInput({ title: 'Ship it' }).valid, true);
});

test('validateCardInput rejects malformed due dates', () => {
  assert.equal(validateCardInput({ title: 'Ship it', dueDate: '24/11/2026' }).errors.dueDate, 'Enter a valid due date.');
  assert.equal(validateCardInput({ title: 'Ship it', dueDate: '2026-11-24' }).valid, true);
});

test('shortcuts: n opens the new-card form but not while typing', () => {
  assert.equal(getShortcutAction({ key: 'n', target: { tagName: 'BODY' } }), 'new-card');
  assert.equal(getShortcutAction({ key: 'n', target: { tagName: 'INPUT' } }), null);
  assert.equal(getShortcutAction({ key: 'z', ctrlKey: true, target: { tagName: 'BODY' } }), 'undo');
  assert.equal(getShortcutAction({ key: 'q', target: { tagName: 'BODY' } }), null);
});
