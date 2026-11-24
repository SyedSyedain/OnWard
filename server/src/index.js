import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './lib/logger.js';

createApp().listen(config.port, () => {
  logger.info('OnWard API started', {
    url: `http://localhost:${config.port}/api`,
    ai: [
      config.openai.enabled && `openai (${config.openai.model})`,
      config.gemini.enabled && `gemini (${config.gemini.model})`,
    ]
      .filter(Boolean)
      .join(', then ') || 'prepared answers only (no AI key set)',
  });
});
