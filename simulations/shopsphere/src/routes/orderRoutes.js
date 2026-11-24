import { Router } from 'express';

export function createOrderRoutes(orderService) {
  const router = Router();

  router.post('/', (req, res) => {
    res.status(201).json(orderService.checkout(req.body.cartId));
  });

  return router;
}
