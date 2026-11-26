import { config } from '../config/env.js';
import { primaryProvider } from '../services/ai/llm.js';

/** `ai` is "openai" or "gemini" when a live AI key is set, "fallback" when replies come from prepared answers. */
export function getHealth(req, res) {
  res.json({ status: 'ok', ai: primaryProvider(), demo: config.demoMode });
}
