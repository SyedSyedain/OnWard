import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from '../helpers.js';
import { ConflictError } from '../../src/lib/errors.js';

function placeOrder(services) {
  services.cartService.addItem('c-1', { productId: 'p-1', quantity: 3 });
  return services.orderService.checkout('c-1');
}

test('[acceptance] cancelling an order that is already cancelled is rejected', () => {
  const services = createTestServices();
  const order = placeOrder(services);
  services.orderService.cancelOrder(order.id);

  assert.throws(() => services.orderService.cancelOrder(order.id), ConflictError);
});

test('[acceptance] cancelling the same order twice restocks its items only once', () => {
  const services = createTestServices();
  const order = placeOrder(services);
  services.orderService.cancelOrder(order.id);
  assert.throws(() => services.orderService.cancelOrder(order.id), ConflictError);

  assert.equal(services.store.products.get('p-1').stock, 10);
});

test('[acceptance] a confirmed order can still be cancelled and is restocked', () => {
  const services = createTestServices();
  const order = placeOrder(services);
  assert.equal(services.store.products.get('p-1').stock, 7);

  const cancelled = services.orderService.cancelOrder(order.id);
  assert.equal(cancelled.status, 'CANCELLED');
  assert.equal(services.store.products.get('p-1').stock, 10);
});
