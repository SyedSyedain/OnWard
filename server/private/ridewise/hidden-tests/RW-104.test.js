import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices, T0 } from '../helpers.js';
import { ValidationError } from '../../src/lib/errors.js';

const redeem = (s, code, riderId) =>
  s.promoService.redeem({ code, riderId, fareInPaise: 20000, at: T0 });

test('[acceptance] a promo typed in lower case cannot be used twice by the same rider', () => {
  const s = createTestServices();
  redeem(s, 'save20', 'r-1');
  assert.throws(() => redeem(s, 'save20', 'r-1'), ValidationError);
});

test('[acceptance] changing the case of a used promo does not allow another use', () => {
  const s = createTestServices();
  redeem(s, 'save20', 'r-1');
  assert.throws(() => redeem(s, 'SAVE20', 'r-1'), ValidationError);
  assert.throws(() => redeem(s, ' Save20 ', 'r-1'), ValidationError);
});

test('[acceptance] other riders can still use the promo once', () => {
  const s = createTestServices();
  const first = redeem(s, 'save20', 'r-1');
  const second = redeem(s, 'Save20', 'r-2');
  assert.equal(first.code, 'SAVE20');
  assert.equal(second.discountInPaise, 4000);
  assert.throws(() => redeem(s, 'SAVE20', 'r-2'), ValidationError);
});
