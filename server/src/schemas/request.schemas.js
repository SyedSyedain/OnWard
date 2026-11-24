/**
 * Validation rules for request bodies and query strings.
 */

import { z } from 'zod';

const filePath = z.string().trim().min(1).max(200);

export const createSessionBody = z.object({
  studentName: z.string().trim().min(2, 'Please enter your name.').max(60),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  roleId: z.enum(['frontend-developer', 'backend-developer']).default('backend-developer'),
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

/** A signed record copy kept by the browser or a shared link. The signature check decides if it is real. */
export const restoreRecordBody = z.object({
  record: z.looseObject({
    id: z.string().regex(/^rec_[A-Za-z0-9_-]{4,40}$/),
    issuedAt: z.string().max(40),
    signature: z.string().regex(/^[0-9a-f]{64}$/),
  }),
});
