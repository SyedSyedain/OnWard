import { isGeminiEnabled } from '../services/ai/geminiClient.js';

export function getHealth(req, res) {
  res.json({ status: 'ok', ai: isGeminiEnabled() ? 'gemini' : 'fallback' });
}
