import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from '../helpers.js';
import { ConflictError } from '../../src/lib/errors.js';

test('[acceptance] a failed checkout leaves every stock count unchanged', () => {
  const { cartService, orderService, store } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 4 });
  cartService.addItem('c-1', { productId: 'p-2', quantity: 9 });

  assert.throws(() => orderService.checkout('c-1'), ConflictError);
  assert.equal(store.products.get('p-1').stock, 10);
  assert.equal(store.products.get('p-2').stock, 3);
});

test('[acceptance] a failed checkout keeps the cart so the customer can fix it', () => {
  const { cartService, orderService } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 1 });
  cartService.addItem('c-1', { productId: 'p-2', quantity: 9 });

  assert.throws(() => orderService.checkout('c-1'), ConflictError);
  assert.equal(cartService.getCart('c-1').items.length, 2);
});

test('[acceptance] a successful multi-item checkout reduces stock for every item', () => {
  const { cartService, orderService, store } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 4 });
  cartService.addItem('c-1', { productId: 'p-2', quantity: 3 });

  orderService.checkout('c-1');
  assert.equal(store.products.get('p-1').stock, 6);
  assert.equal(store.products.get('p-2').stock, 0);
});
