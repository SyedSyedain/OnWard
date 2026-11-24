import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidPhone, validateBooking } from '../../src/lib/validation.js';

test('[acceptance] a 9-digit phone number is rejected with a phone error', () => {
  assert.equal(isValidPhone('987654321'), false);
  const { valid, errors } = validateBooking({ name: 'Asha Nair', phone: '987654321', reason: 'Fever' });
  assert.equal(valid, false);
  assert.ok(errors.phone);
});

test('[acceptance] a short number is still rejected when it has spaces or a country code', () => {
  assert.equal(isValidPhone('98765 4321'), false);
  assert.equal(isValidPhone('+91 98765-4321'), false);
});

test('[acceptance] valid 10-digit numbers are still accepted', () => {
  assert.equal(isValidPhone('9876543210'), true);
  assert.equal(isValidPhone('98765 43210'), true);
  assert.equal(isValidPhone('+91 98765-43210'), true);
  assert.equal(isValidPhone('09876543210'), true);
  assert.equal(isValidPhone('98765432101'), false);
});
