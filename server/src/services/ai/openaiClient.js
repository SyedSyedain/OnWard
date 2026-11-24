/**
 * Thin wrapper around the OpenAI SDK, shaped like the Gemini client: every call
 * returns `null` instead of throwing, so callers fall through to the next provider.
 *
 * A rate-limited or failing key is skipped for a short while so students are not
 * kept waiting on it. The key is read from config only; it is never logged.
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

const REQUEST_TIMEOUT_MS = 20_000;
const COOL_DOWN_MS = 60_000;

const client = config.openai.enabled
  ? new OpenAI({ apiKey: config.openai.apiKey, timeout: REQUEST_TIMEOUT_MS, maxRetries: 0 })
  : null;
let coolingUntil = 0;
let sendReasoningEffort = Boolean(config.openai.reasoningEffort);

export function isOpenAIEnabled() {
  return client !== null;
}

/**
 * Asks OpenAI for JSON that matches a zod schema.
 * @returns {Promise<object|null>} parsed data, or null if unavailable or invalid
 */
export async function generateStructured({ systemInstruction, prompt, schema, purpose }) {
  if (!client || Date.now() < coolingUntil) return null;

  try {
    const response = await client.chat.completions.create(request({ systemInstruction, prompt, schema }));
    const result = schema.safeParse(JSON.parse(response.choices[0]?.message?.content ?? ''));
    if (!result.success) {
      logger.warn('OpenAI returned data that failed validation', { purpose });
      return null;
    }
    return result.data;
  } catch (error) {
    // Some models do not take a reasoning effort: drop it once and ask again.
    if (sendReasoningEffort && error.status === 400 && /reasoning/i.test(error.message ?? '')) {
      sendReasoningEffort = false;
      logger.warn('OpenAI model does not take a reasoning effort; retrying without it', { purpose });
      return generateStructured({ systemInstruction, prompt, schema, purpose });
    }
    if (error.status === 401 || error.status === 403 || error.status === 429 || error.status >= 500 || !error.status) {
      coolingUntil = Date.now() + COOL_DOWN_MS;
    }
    logger.warn('OpenAI request failed, trying the next provider', {
      purpose,
      model: config.openai.model,
      status: error.status ?? null,
      code: error.code ?? null,
    });
    return null;
  }
}

function request({ systemInstruction, prompt, schema }) {
  const { $schema, ...jsonSchema } = z.toJSONSchema(schema);
  return {
    model: config.openai.model,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_schema', json_schema: { name: 'response', schema: jsonSchema, strict: false } },
    ...(sendReasoningEffort && { reasoning_effort: config.openai.reasoningEffort }),
  };
}
