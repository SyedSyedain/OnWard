/**
 * Thin wrapper around the Gemini SDK.
 *
 * Every call returns `null` instead of throwing when Gemini is not configured,
 * times out, or returns something that fails validation. Callers then use
 * their deterministic fallback, so the product works with or without a key.
 *
 * When a model is overloaded, rate limited or slow, the call moves on to the
 * next model in `GEMINI_FALLBACK_MODELS`, and that model is skipped for a short
 * while so later calls do not wait on it again.
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

const REQUEST_TIMEOUT_MS = 12_000;
const COOL_DOWN_MS = 60_000;
// 429: rate limited or quota used up. 500, 503, 504: the model is having trouble.
const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);

const client = config.gemini.enabled ? new GoogleGenAI({ apiKey: config.gemini.apiKey }) : null;
const models = [...new Set([config.gemini.model, ...config.gemini.fallbackModels])];
const coolingUntil = new Map();

export function isGeminiEnabled() {
  return client !== null;
}

/**
 * Asks Gemini for JSON that matches a zod schema.
 * @returns {Promise<object|null>} parsed data, or null if unavailable or invalid
 */
export async function generateStructured({ systemInstruction, prompt, schema, purpose }) {
  if (!client) {
    return null;
  }

  for (const model of modelsToTry()) {
    try {
      const response = await withTimeout(
        client.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseJsonSchema: z.toJSONSchema(schema),
            temperature: 0.4,
          },
        }),
      );

      const result = schema.safeParse(JSON.parse(response.text ?? ''));
      if (!result.success) {
        logger.warn('Gemini returned data that failed validation', { purpose, model });
        return null;
      }
      return result.data;
    } catch (error) {
      if (!isRetryable(error)) {
        logger.warn('Gemini request failed, using fallback', { purpose, model, reason: error.message });
        return null;
      }
      coolingUntil.set(model, Date.now() + COOL_DOWN_MS);
      logger.warn('Gemini model unavailable, trying the next one', { purpose, model, status: statusOf(error) });
    }
  }

  logger.warn('No Gemini model available, using fallback', { purpose });
  return null;
}

/** Models that are not cooling down, in order; all of them if every one is. */
function modelsToTry() {
  const now = Date.now();
  const ready = models.filter((model) => (coolingUntil.get(model) ?? 0) <= now);
  return ready.length > 0 ? ready : models;
}

function isRetryable(error) {
  return error.message === 'Gemini request timed out' || RETRYABLE_STATUS.has(statusOf(error));
}

/** The HTTP status of an SDK error, from its `status` field or the JSON body in its message. */
function statusOf(error) {
  if (typeof error.status === 'number') return error.status;
  const match = /"code"\s*:\s*(\d{3})/.exec(error.message ?? '');
  return match ? Number(match[1]) : null;
}

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini request timed out')), REQUEST_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
