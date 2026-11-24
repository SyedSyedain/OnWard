import { Router } from 'express';
import { getRecord } from '../controllers/records.controller.js';

export const recordsRouter = Router();

recordsRouter.get('/:recordId', getRecord);
