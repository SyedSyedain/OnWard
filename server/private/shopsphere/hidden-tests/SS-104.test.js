import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from '../helpers.js';

test('[acceptance] the in-stock listing leaves out products with zero stock', () => {
  const { productService } = createTestServices();
  const soldOut = productService.createProduct({ name: 'Sold Out Item', priceInPaise: 5000, stock: 0 });

  const ids = productService.listProducts({ inStockOnly: true }).map((product) => product.id);
  assert.ok(!ids.includes(soldOut.id));
});

test('[acceptance] the in-stock listing still includes products with stock', () => {
  const { productService } = createTestServices();
  productService.createProduct({ name: 'Sold Out Item', priceInPaise: 5000, stock: 0 });

  const ids = productService.listProducts({ inStockOnly: true }).map((product) => product.id);
  assert.deepEqual(ids, ['p-1', 'p-2']);
});

test('[acceptance] the full listing still includes sold-out products', () => {
  const { productService } = createTestServices();
  const soldOut = productService.createProduct({ name: 'Sold Out Item', priceInPaise: 5000, stock: 0 });

  const ids = productService.listProducts().map((product) => product.id);
  assert.equal(ids.length, 3);
  assert.ok(ids.includes(soldOut.id));
});
