/**
 * Builds a fresh, isolated set of services for each test.
 */

import { createStore } from '../src/repositories/createStore.js';
import { createProductService } from '../src/services/productService.js';
import { createCartService } from '../src/services/cartService.js';
import { createOrderService } from '../src/services/orderService.js';

export function createTestServices(products = defaultProducts()) {
  const store = createStore({ products });
  const productService = createProductService(store);
  const cartService = createCartService(store);
  const orderService = createOrderService(store, cartService);
  return { store, productService, cartService, orderService };
}

export function defaultProducts() {
  return [
    { id: 'p-1', name: 'Desk Lamp', priceInPaise: 99900, stock: 10 },
    { id: 'p-2', name: 'Notebook', priceInPaise: 14900, stock: 3 },
  ];
}
