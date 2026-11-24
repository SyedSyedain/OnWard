import { Router } from 'express';

export function createProductRoutes(productService) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json(productService.searchProducts(req.query.q ?? ''));
  });

  router.get('/:productId', (req, res) => {
    res.json(productService.getProduct(req.params.productId));
  });

  router.post('/', (req, res) => {
    res.status(201).json(productService.createProduct(req.body));
  });

  return router;
}
