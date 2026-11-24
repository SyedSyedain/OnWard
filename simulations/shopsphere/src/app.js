/**
 * Builds the ShopSphere Express app.
 * Services are created here and passed into the routes that use them.
 */

import express from 'express';
import { seedProducts } from './data/seed.js';
import { createStore } from './repositories/createStore.js';
import { createProductService } from './services/productService.js';
import { createCartService } from './services/cartService.js';
import { createOrderService } from './services/orderService.js';
import { createProductRoutes } from './routes/productRoutes.js';
import { createCartRoutes } from './routes/cartRoutes.js';
import { createOrderRoutes } from './routes/orderRoutes.js';

export function createApp(store = createStore({ products: seedProducts })) {
  const productService = createProductService(store);
  const cartService = createCartService(store);
  const orderService = createOrderService(store, cartService);

  const app = express();
  app.use(express.json());

  app.use('/products', createProductRoutes(productService));
  app.use('/carts', createCartRoutes(cartService));
  app.use('/orders', createOrderRoutes(orderService));

  // Express 4 forwards errors thrown in route handlers to this middleware.
  app.use((error, req, res, next) => {
    const status = error.status ?? 500;
    res.status(status).json({ error: error.name, message: error.message });
  });

  return app;
}
