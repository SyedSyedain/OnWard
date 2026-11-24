/**
 * Product catalogue rules: creating products and searching the catalogue.
 */

import { randomUUID } from 'node:crypto';
import { NotFoundError, ValidationError } from '../lib/errors.js';

export function createProductService(store) {
  function createProduct({ name, priceInPaise, stock = 0 }) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new ValidationError('Product name is required.');
    }
    if (!Number.isInteger(priceInPaise)) {
      throw new ValidationError('Price must be a whole number of paise.');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new ValidationError('Stock must be a whole number of zero or more.');
    }

    const product = { id: `p-${randomUUID().slice(0, 8)}`, name: name.trim(), priceInPaise, stock };
    store.products.set(product.id, product);
    return { ...product };
  }

  function getProduct(productId) {
    const product = store.products.get(productId);
    if (!product) {
      throw new NotFoundError(`Product ${productId} does not exist.`);
    }
    return { ...product };
  }

  function searchProducts(query = '') {
    const term = query.trim().toLowerCase();
    return [...store.products.values()]
      .filter((product) => product.name.toLowerCase().includes(term))
      .map((product) => ({ ...product }));
  }

  return { createProduct, getProduct, searchProducts };
}
