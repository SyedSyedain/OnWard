import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NotFoundError, ValidationError } from '../src/lib/errors.js';
import { createTestServices, bookRide, T0 } from './helpers.js';

test('a promo takes a percentage off the fare', () => {
  const s = createTestServices();
  const { discountInPaise, code } = s.promoService.redeem({ code: 'SAVE20', riderId: 'r-1', fareInPaise: 20000, at: T0 });
  assert.equal(code, 'SAVE20');
  assert.equal(discountInPaise, 4000);
});

test('the discount is capped at the promo maximum', () => {
  const s = createTestServices();
  const { discountInPaise } = s.promoService.redeem({ code: 'SAVE20', riderId: 'r-1', fareInPaise: 200000, at: T0 });
  assert.equal(discountInPaise, 10000);
});

test('expired and unknown promos are rejected', () => {
  const s = createTestServices();
  assert.throws(() => s.promoService.redeem({ code: 'OLD10', riderId: 'r-1', fareInPaise: 20000, at: T0 }), ValidationError);
  assert.throws(() => s.promoService.redeem({ code: 'NOPE', riderId: 'r-1', fareInPaise: 20000, at: T0 }), NotFoundError);
});

test('a promo can be used once per rider but by different riders', () => {
  const s = createTestServices();
  s.promoService.redeem({ code: 'SAVE20', riderId: 'r-1', fareInPaise: 20000, at: T0 });
  assert.throws(() => s.promoService.redeem({ code: 'SAVE20', riderId: 'r-1', fareInPaise: 20000, at: T0 }), ValidationError);
  assert.doesNotThrow(() => s.promoService.redeem({ code: 'SAVE20', riderId: 'r-2', fareInPaise: 20000, at: T0 }));
});

test('booking with a promo lowers the ride fare', () => {
  const s = createTestServices();
  const plain = bookRide(s, { riderId: 'r-1' });
  const promo = bookRide(s, { riderId: 'r-2', promoCode: 'SAVE20' });
  assert.equal(promo.promoCode, 'SAVE20');
  assert.equal(promo.fareInPaise, plain.fareInPaise - promo.discountInPaise);
  assert.ok(promo.discountInPaise > 0);
});
