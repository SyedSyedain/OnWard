/**
 * Loads prompt templates from src/prompts and fills {{placeholders}}.
 * Keeping prompts in Markdown files makes them easy to review and version.
 */

import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config/env.js';

const templateCache = new Map();

export function renderPrompt(name, variables = {}) {
  if (!templateCache.has(name)) {
    templateCache.set(name, fs.readFileSync(path.join(config.paths.prompts, `${name}.md`), 'utf8'));
  }

  return templateCache.get(name).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in variables)) {
      throw new Error(`Prompt "${name}" is missing the variable "${key}".`);
    }
    const value = variables[key];
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  });
}

/** Formats a chat history as plain text for a prompt. */
export function formatConversation(messages, labels) {
  if (messages.length === 0) {
    return '(no previous messages)';
  }
  return messages.map((message) => `${labels[message.author]}: ${message.text}`).join('\n');
}
