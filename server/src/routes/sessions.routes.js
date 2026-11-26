import { Router } from 'express';
import * as controller from '../controllers/sessions.controller.js';
import { aiLimiter, testRunLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import {
  chatMessageBody,
  createSessionBody,
  filePathQuery,
  saveFileBody,
  teammateMessageBody,
} from '../schemas/request.schemas.js';

export const sessionsRouter = Router();

sessionsRouter.post('/', aiLimiter, validate('body', createSessionBody), controller.createSession);
sessionsRouter.get('/:sessionId', controller.getSession);

sessionsRouter.post('/:sessionId/manager/messages', aiLimiter, validate('body', chatMessageBody), controller.sendManagerMessage);
sessionsRouter.post('/:sessionId/workspace', controller.startWork);

sessionsRouter.get('/:sessionId/files', controller.listFiles);
sessionsRouter.get('/:sessionId/files/content', validate('query', filePathQuery), controller.readFile);
sessionsRouter.put('/:sessionId/files/content', validate('body', saveFileBody), controller.saveFile);

sessionsRouter.get('/:sessionId/solution', controller.getSolution);
sessionsRouter.post('/:sessionId/test-runs', testRunLimiter, controller.runTests);
sessionsRouter.post('/:sessionId/teammate/messages', aiLimiter, validate('body', teammateMessageBody), controller.sendTeammateMessage);
sessionsRouter.get('/:sessionId/changes', controller.listChanges);
sessionsRouter.post('/:sessionId/reviews', aiLimiter, controller.requestReview);
sessionsRouter.post('/:sessionId/submission', aiLimiter, controller.submit);
