import { Router } from 'express';

export function createOrderRoutes(orderService) {
  const router = Router();

  router.post('/', (req, res) => {
    res.status(201).json(orderService.checkout(req.body.cartId));
  });

  router.post('/:orderId/cancel', (req, res) => {
    res.json(orderService.cancelOrder(req.params.orderId));
  });

  return router;
}
