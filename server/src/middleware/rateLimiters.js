import { rateLimit } from 'express-rate-limit';

function limiter(limit, message) {
  return rateLimit({
    windowMs: 60_000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ error: { code: 'RATE_LIMITED', message } }),
  });
}

/** Protects the Gemini quota. */
export const aiLimiter = limiter(20, 'Too many AI requests. Please wait a minute.');

/** Each test run starts a child process, so it is limited separately. */
export const testRunLimiter = limiter(10, 'Too many test runs. Please wait a minute.');
