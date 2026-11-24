/**
 * Thin wrapper around the Gemini SDK.
 *
 * Every call returns `null` instead of throwing when Gemini is not configured,
 * times out, or returns something that fails validation. Callers then use
 * their deterministic fallback, so the product works with or without a key.
 *
 * When a model is overloaded, rate limited or slow, the call moves on to the
 * next model in `GEMINI_FALLBACK_MODELS`, and that model is skipped for a short
 * while so later calls do not wait on it again. One call never waits longer than
 * `CALL_BUDGET_MS` in total, and when every model is cooling down it answers from
 * the fallback at once, so a busy Gemini costs the student seconds, not a minute.
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

const CALL_BUDGET_MS = 10_000;
const MIN_ATTEMPT_MS = 2_000;
// Rate limits last longer than overload spikes.
const COOL_DOWN_MS = { rateLimited: 60_000, busy: 20_000 };
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

  const deadline = Date.now() + CALL_BUDGET_MS;
  for (const model of modelsToTry()) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) break;
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
        remaining,
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
      const status = statusOf(error);
      coolingUntil.set(model, Date.now() + (status === 429 ? COOL_DOWN_MS.rateLimited : COOL_DOWN_MS.busy));
      logger.warn('Gemini model unavailable, trying the next one', { purpose, model, status });
    }
  }

  logger.warn('No Gemini model available, using fallback', { purpose });
  return null;
}

/** Models that are not cooling down, in order. Empty while all of them are. */
function modelsToTry() {
  const now = Date.now();
  return models.filter((model) => (coolingUntil.get(model) ?? 0) <= now);
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

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
