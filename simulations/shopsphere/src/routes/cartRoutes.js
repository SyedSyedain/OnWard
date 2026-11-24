import { Router } from 'express';

export function createCartRoutes(cartService) {
  const router = Router();

  router.get('/:cartId', (req, res) => {
    res.json(cartService.getCart(req.params.cartId));
  });

  router.post('/:cartId/items', (req, res) => {
    res.status(201).json(cartService.addItem(req.params.cartId, req.body));
  });

  return router;
}
