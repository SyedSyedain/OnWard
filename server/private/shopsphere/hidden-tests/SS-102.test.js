import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from '../helpers.js';

test('[acceptance] adding the same product twice combines the quantities', () => {
  const { cartService } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 2 });
  const cart = cartService.addItem('c-1', { productId: 'p-1', quantity: 3 });

  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 5);
});

test('[acceptance] the cart total uses the combined quantity', () => {
  const { cartService } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-2', quantity: 1 });
  const cart = cartService.addItem('c-1', { productId: 'p-2', quantity: 1 });

  assert.equal(cart.totalInPaise, 29800);
});

test('[acceptance] different products stay on separate cart lines', () => {
  const { cartService } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 1 });
  const cart = cartService.addItem('c-1', { productId: 'p-2', quantity: 1 });

  assert.equal(cart.items.length, 2);
});
