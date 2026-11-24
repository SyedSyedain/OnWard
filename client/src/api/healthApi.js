import { request } from './httpClient.js';

/** `ai` is "gemini" when live AI is configured on the server, "fallback" when replies come from templates. */
export const healthApi = {
  get: () => request('GET', '/health'),
};
