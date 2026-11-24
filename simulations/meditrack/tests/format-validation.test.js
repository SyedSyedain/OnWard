import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDay, formatDoctorName, formatTime } from '../src/lib/format.js';
import { isValidPhone, normalizePhone, validateBooking } from '../src/lib/validation.js';
import { escapeHtml } from '../src/lib/html.js';

test('formatTime converts morning and afternoon times', () => {
  assert.equal(formatTime('09:05'), '9:05 AM');
  assert.equal(formatTime('15:45'), '3:45 PM');
  assert.equal(formatTime('23:59'), '11:59 PM');
});

test('formatDay shows weekday, day and month', () => {
  assert.equal(formatDay('2026-12-01'), 'Tue, 1 Dec');
  assert.equal(formatDay('2026-12-25'), 'Fri, 25 Dec');
});

test('formatDoctorName adds the title', () => {
  assert.equal(formatDoctorName({ name: 'Meera Iyer' }), 'Dr. Meera Iyer');
});

test('normalizePhone removes separators and the country code', () => {
  assert.equal(normalizePhone('+91 98765-43210'), '9876543210');
  assert.equal(normalizePhone('(98765) 43210'), '9876543210');
});

test('isValidPhone accepts ten digits and rejects letters and long numbers', () => {
  assert.equal(isValidPhone('9876543210'), true);
  assert.equal(isValidPhone('98765 43210'), true);
  assert.equal(isValidPhone('98765abc10'), false);
  assert.equal(isValidPhone('987654321012'), false);
  assert.equal(isValidPhone(''), false);
});

test('validateBooking accepts a complete form', () => {
  const result = validateBooking({ name: 'Asha Nair', phone: '9876543210', reason: 'Fever' });
  assert.deepEqual(result, { valid: true, errors: {} });
});

test('validateBooking reports a missing name and reason', () => {
  const { valid, errors } = validateBooking({ name: ' ', phone: '9876543210', reason: '  ' });
  assert.equal(valid, false);
  assert.ok(errors.name);
  assert.ok(errors.reason);
  assert.equal(errors.phone, undefined);
});

test('validateBooking rejects an overly long reason', () => {
  const { errors } = validateBooking({ name: 'Asha', phone: '9876543210', reason: 'x'.repeat(201) });
  assert.ok(errors.reason);
});

test('escapeHtml escapes markup characters', () => {
  assert.equal(escapeHtml('<b a="1">&\'</b>'), '&lt;b a=&quot;1&quot;&gt;&amp;&#39;&lt;/b&gt;');
  assert.equal(escapeHtml(null), '');
});
