import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from './helpers.js';
import { ValidationError } from '../src/lib/errors.js';

test('creates a product with a valid name and price', () => {
  const { productService } = createTestServices();
  const product = productService.createProduct({ name: 'Mouse Pad', priceInPaise: 29900, stock: 4 });

  assert.equal(product.name, 'Mouse Pad');
  assert.equal(productService.getProduct(product.id).priceInPaise, 29900);
});

test('rejects a product without a name', () => {
  const { productService } = createTestServices();
  assert.throws(() => productService.createProduct({ name: ' ', priceInPaise: 100 }), ValidationError);
});

test('search is case-insensitive', () => {
  const { productService } = createTestServices();
  const results = productService.searchProducts('LAMP');

  assert.deepEqual(results.map((product) => product.id), ['p-1']);
});
