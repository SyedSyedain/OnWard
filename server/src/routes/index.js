import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { recordsRouter } from './records.routes.js';
import { sessionsRouter } from './sessions.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', getHealth);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/records', recordsRouter);
