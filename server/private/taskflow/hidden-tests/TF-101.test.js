import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCardInput } from '../../src/lib/validation.js';

test('[acceptance] a title made only of spaces is rejected', () => {
  const result = validateCardInput({ title: '     ' });
  assert.equal(result.valid, false);
  assert.equal(validateCardInput({ title: '\t \n' }).valid, false);
});

test('[acceptance] a whitespace-only title reports the required-title error', () => {
  const result = validateCardInput({ title: '   ' });
  assert.equal(result.errors.title, 'Title is required.');
});

test('[acceptance] a real title, even with surrounding spaces, is still accepted', () => {
  assert.equal(validateCardInput({ title: '  Ship it  ' }).valid, true);
  assert.equal(validateCardInput({ title: 'Ship it', assignee: 'Asha', dueDate: '2026-11-30' }).valid, true);
});
