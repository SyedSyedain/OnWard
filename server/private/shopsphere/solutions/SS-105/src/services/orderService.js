/**
 * Checkout rules: turning a cart into an order and reserving stock.
 */

import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';

export function createOrderService(store, cartService) {
  function checkout(cartId) {
    const cart = cartService.getCart(cartId);
    if (cart.items.length === 0) {
      throw new ValidationError('Cannot check out an empty cart.');
    }

    for (const item of cart.items) {
      const product = store.products.get(item.productId);
      if (product.stock < item.quantity) {
        throw new ConflictError(`Only ${product.stock} of "${product.name}" left in stock.`);
      }
      product.stock -= item.quantity;
    }

    const order = {
      id: `ord-${String(store.nextOrderNumber++).padStart(5, '0')}`,
      cartId,
      items: cart.items,
      totalInPaise: cart.totalInPaise,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
    store.orders.set(order.id, order);
    cartService.clearCart(cartId);

    return order;
  }

  /**
   * Cancels a confirmed order and puts its items back into stock.
   */
  function cancelOrder(orderId) {
    const order = store.orders.get(orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} does not exist.`);
    }
    if (order.status === 'CANCELLED') {
      throw new ConflictError(`Order ${orderId} is already cancelled.`);
    }

    for (const item of order.items) {
      const product = store.products.get(item.productId);
      product.stock += item.quantity;
    }
    order.status = 'CANCELLED';

    return order;
  }

  return { checkout, cancelOrder };
}
