/**
 * In-memory storage for ShopSphere.
 * Each collection is a Map keyed by id, so tests can create an isolated store.
 */

export function createStore({ products = [] } = {}) {
  const store = {
    products: new Map(),
    carts: new Map(),
    orders: new Map(),
    nextOrderNumber: 1,
  };

  for (const product of products) {
    store.products.set(product.id, { ...product });
  }

  return store;
}
