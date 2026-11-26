/**
 * Shopping cart rules: adding products and calculating totals.
 */

import { NotFoundError, ValidationError } from '../lib/errors.js';

export function createCartService(store) {
  function getOrCreateCart(cartId) {
    if (!store.carts.has(cartId)) {
      store.carts.set(cartId, { id: cartId, items: [] });
    }
    return store.carts.get(cartId);
  }

  function addItem(cartId, { productId, quantity }) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError('Quantity must be a whole number greater than zero.');
    }
    if (!store.products.has(productId)) {
      throw new NotFoundError(`Product ${productId} does not exist.`);
    }

    const cart = getOrCreateCart(cartId);
    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    return getCart(cartId);
  }

  function getCart(cartId) {
    const cart = getOrCreateCart(cartId);
    const items = cart.items.map((item) => {
      const product = store.products.get(item.productId);
      return {
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        unitPriceInPaise: product.priceInPaise,
        lineTotalInPaise: product.priceInPaise * item.quantity,
      };
    });
    const totalInPaise = items.reduce((sum, item) => sum + item.lineTotalInPaise, 0);

    return { id: cart.id, items, totalInPaise };
  }

  function clearCart(cartId) {
    store.carts.set(cartId, { id: cartId, items: [] });
  }

  return { addItem, getCart, clearCart };
}
