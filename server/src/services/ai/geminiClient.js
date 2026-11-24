/**
 * Thin wrapper around the Gemini SDK.
 *
 * Every call returns `null` instead of throwing when Gemini is not configured,
 * times out, or returns something that fails validation. Callers then use
 * their deterministic fallback, so the product works with or without a key.
 */

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { config } from '../../config/env.js';
import { logger } from '../../lib/logger.js';

const REQUEST_TIMEOUT_MS = 20_000;

const client = config.gemini.enabled ? new GoogleGenAI({ apiKey: config.gemini.apiKey }) : null;

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

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model: config.gemini.model,
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
      logger.warn('Gemini returned data that failed validation', { purpose });
      return null;
    }
    return result.data;
  } catch (error) {
    logger.warn('Gemini request failed, using fallback', { purpose, reason: error.message });
    return null;
  }
}

function withTimeout(promise) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini request timed out')), REQUEST_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
