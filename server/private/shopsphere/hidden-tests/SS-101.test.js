import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestServices } from '../helpers.js';
import { ValidationError } from '../../src/lib/errors.js';

test('[acceptance] a product priced at zero is rejected', () => {
  const { productService } = createTestServices();
  assert.throws(() => productService.createProduct({ name: 'Free Item', priceInPaise: 0 }), ValidationError);
});

test('[acceptance] a product with a negative price is rejected', () => {
  const { productService } = createTestServices();
  assert.throws(() => productService.createProduct({ name: 'Broken Item', priceInPaise: -500 }), ValidationError);
});

test('[acceptance] a product with a positive price is still created', () => {
  const { productService } = createTestServices();
  const product = productService.createProduct({ name: 'Cable', priceInPaise: 1 });
  assert.equal(product.priceInPaise, 1);
});
