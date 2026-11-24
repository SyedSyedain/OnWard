import { Router } from 'express';
import { getRecord, restoreRecord } from '../controllers/records.controller.js';
import { restoreLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { restoreRecordBody } from '../schemas/request.schemas.js';

export const recordsRouter = Router();

recordsRouter.post('/restore', restoreLimiter, validate('body', restoreRecordBody), restoreRecord);
recordsRouter.get('/:recordId', getRecord);
