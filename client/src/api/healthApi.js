import { request } from './httpClient.js';

/** `ai` is "openai" or "gemini" when live AI is configured on the server, "fallback" when replies come from prepared answers. */
export const healthApi = {
  get: () => request('GET', '/health'),
};
