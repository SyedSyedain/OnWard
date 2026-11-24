/**
 * Validation rules for request bodies and query strings.
 */

import { z } from 'zod';

const filePath = z.string().trim().min(1).max(200);

export const createSessionBody = z.object({
  studentName: z.string().trim().min(2, 'Please enter your name.').max(60),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const chatMessageBody = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty.').max(1000),
});

export const teammateMessageBody = z.object({
  teammate: z.enum(['alex', 'sarah', 'daniel']).default('alex'),
  message: z.string().trim().max(1000).default(''),
  filePath: filePath.optional(),
  requestHint: z.boolean().default(false),
});

export const filePathQuery = z.object({
  path: filePath,
});

export const saveFileBody = z.object({
  path: filePath,
  content: z.string(),
});
