/**
 * The AI provider chain: OpenAI when its key is set, then Gemini, then nothing
 * (the caller uses its prepared answer). Each result says which provider wrote it.
 */

import * as gemini from './geminiClient.js';
import * as openai from './openaiClient.js';

const PROVIDERS = [
  { name: 'openai', enabled: openai.isOpenAIEnabled, generate: openai.generateStructured },
  { name: 'gemini', enabled: gemini.isGeminiEnabled, generate: gemini.generateStructured },
];

/** "openai", "gemini" or "fallback": the first provider that is configured. */
export function primaryProvider() {
  return PROVIDERS.find((provider) => provider.enabled())?.name ?? 'fallback';
}

/** @returns {Promise<{ data: object, provider: 'openai' | 'gemini' } | null>} */
export async function generateStructured(request) {
  for (const provider of PROVIDERS) {
    if (!provider.enabled()) continue;
    const data = await provider.generate(request);
    if (data) return { data, provider: provider.name };
  }
  return null;
}
