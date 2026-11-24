import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from './helpers.js';
import { ConflictError, NotFoundError, ValidationError } from '../src/lib/errors.js';

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

test('cancelling an order restocks its items and marks it cancelled', () => {
  const { cartService, orderService, store } = createTestServices();
  cartService.addItem('c-1', { productId: 'p-1', quantity: 2 });
  const order = orderService.checkout('c-1');

  const cancelled = orderService.cancelOrder(order.id);

  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal(store.products.get('p-1').stock, 10);
});

test('cancelling an unknown order is rejected', () => {
  const { orderService } = createTestServices();
  assert.throws(() => orderService.cancelOrder('ord-99999'), NotFoundError);
});
