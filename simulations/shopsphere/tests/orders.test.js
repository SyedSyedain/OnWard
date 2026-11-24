import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from './helpers.js';
import { ConflictError, ValidationError } from '../src/lib/errors.js';

test('checkout creates an order and reduces stock', () => {
  const { cartService, orderService, store } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 2 });

  const order = orderService.checkout('c-1');

  assert.equal(order.status, 'CONFIRMED');
  assert.equal(store.products.get('p-1').stock, 8);
  assert.equal(cartService.getCart('c-1').items.length, 0);
});

test('checkout of an empty cart is rejected', () => {
  const { orderService } = createTestServices();
  assert.throws(() => orderService.checkout('c-empty'), ValidationError);
});

test('checkout fails when an item is out of stock', () => {
  const { cartService, orderService } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-2', quantity: 5 });

  assert.throws(() => orderService.checkout('c-1'), ConflictError);
});
