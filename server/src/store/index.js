import path from 'node:path';
import { config } from '../config/env.js';
import { createJsonCollection } from './createJsonCollection.js';

export const sessionsCollection = createJsonCollection(path.join(config.paths.storage, 'sessions.json'));
export const recordsCollection = createJsonCollection(path.join(config.paths.storage, 'records.json'));
