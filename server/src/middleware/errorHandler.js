import { AppError } from '../lib/AppError.js';
import { logger } from '../lib/logger.js';

export function notFoundHandler(req, res, next) {
  next(AppError.notFound(`Route ${req.method} ${req.path} does not exist.`, 'ROUTE_NOT_FOUND'));
}

// Express recognises error handlers by their four parameters.
export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' } });
  }

  logger.error('Unhandled error', { method: req.method, path: req.path, reason: error.message });
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side.' } });
}
