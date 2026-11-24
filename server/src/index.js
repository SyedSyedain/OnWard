import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './lib/logger.js';

createApp().listen(config.port, () => {
  logger.info('OnWard API started', {
    url: `http://localhost:${config.port}/api`,
    ai: config.gemini.enabled ? `gemini (${config.gemini.model})` : 'fallback mode (no GEMINI_API_KEY)',
  });
});
