/**
 * Reads and validates environment variables once at startup.
 * The rest of the server imports `config` instead of touching process.env.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = path.resolve(serverRoot, '..');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5050),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  // OpenAI is tried first when its key is set; Gemini next; then the prepared answers.
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_MODEL: z.string().default('gpt-5.4-mini'),
  // Lower is faster. Leave empty for a model that does not take a reasoning effort.
  OPENAI_REASONING_EFFORT: z.enum(['', 'minimal', 'low', 'medium', 'high']).default('low'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.8-flash'),
  // Tried in order when the main model is overloaded, rate limited or slow.
  GEMINI_FALLBACK_MODELS: z.string().default('gemini-3.7-flash,gemini-3.5-flash-lite'),
  RECORD_SECRET: z.string().min(16, 'RECORD_SECRET must be at least 16 characters.').default('local-development-secret-only'),
  TEST_RUN_TIMEOUT_SECONDS: z.coerce.number().int().min(5).max(120).default(20),
  // Demo only: lets the Codespace load the predefined solution for a ticket. Leave off for real use.
  DEMO_MODE: z.enum(['true', 'false', '']).default('false'),
  DATA_DIRECTORY: z.string().default(path.join(serverRoot, '.data')),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${problems.join('\n')}`);
}

const env = parsed.data;

export const config = Object.freeze({
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  clientOrigin: env.CLIENT_ORIGIN,
  openai: Object.freeze({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    reasoningEffort: env.OPENAI_REASONING_EFFORT || null,
    enabled: env.OPENAI_API_KEY.trim().length > 0,
  }),
  gemini: Object.freeze({
    apiKey: env.GEMINI_API_KEY,
    model: env.GEMINI_MODEL,
    fallbackModels: env.GEMINI_FALLBACK_MODELS.split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    enabled: env.GEMINI_API_KEY.trim().length > 0,
  }),
  recordSecret: env.RECORD_SECRET,
  demoMode: env.DEMO_MODE === 'true',
  testRunTimeoutMs: env.TEST_RUN_TIMEOUT_SECONDS * 1000,
  paths: Object.freeze({
    simulations: path.join(repoRoot, 'simulations'),
    privateData: path.join(serverRoot, 'private'),
    workspaces: path.join(env.DATA_DIRECTORY, 'workspaces'),
    storage: path.join(env.DATA_DIRECTORY, 'store'),
    prompts: path.join(serverRoot, 'src', 'prompts'),
  }),
});
