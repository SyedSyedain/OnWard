/**
 * Builds the Express application. Kept separate from index.js so tests can
 * create the app without opening a port.
 */

import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  // Hosted behind one proxy (Render), so rate limits must read the visitor's address from it.
  if (config.nodeEnv === 'production') app.set('trust proxy', 1);
  app.use(securityHeaders({ https: config.nodeEnv === 'production' }));
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: '300kb' }));

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
