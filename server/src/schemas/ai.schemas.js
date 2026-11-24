/**
 * Shapes the AI roles must return. Gemini output is validated against these
 * before it is used; anything that does not match falls back to defaults.
 */

import { z } from 'zod';

export const ticketSchema = z.object({
  title: z.string().min(5).max(120),
  summary: z.string().min(20).max(600),
  businessImpact: z.string().min(10).max(400),
});

export const chatReplySchema = z.object({
  reply: z.string().min(1).max(1500),
});

const reviewAspect = z.object({
  rating: z.number().int().min(1).max(5),
  note: z.string().min(1).max(240),
});

export const reviewSchema = z.object({
  summary: z.string().min(10).max(800),
  strengths: z.array(z.string().max(300)).max(4),
  improvements: z.array(z.string().max(300)).max(4),
  qualityScore: z.number().int().min(0).max(25),
  aspects: z.object({
    edgeCases: reviewAspect,
    reliability: reviewAspect,
    maintainability: reviewAspect,
  }),
});
