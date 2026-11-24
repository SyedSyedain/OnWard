import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from './helpers.js';
import { NotFoundError, ValidationError } from '../src/lib/errors.js';

test('adds a new product to an empty cart', () => {
  const { cartService } = createTestServices();
  const cart = cartService.addItem('c-1', { productId: 'p-1', quantity: 2 });

  assert.equal(cart.items.length, 1);
  assert.equal(cart.totalInPaise, 199800);
});

test('rejects a quantity of zero', () => {
  const { cartService } = createTestServices();
  assert.throws(() => cartService.addItem('c-1', { productId: 'p-1', quantity: 0 }), ValidationError);
});

test('rejects an unknown product', () => {
  const { cartService } = createTestServices();
  assert.throws(() => cartService.addItem('c-1', { productId: 'nope', quantity: 1 }), NotFoundError);
});
