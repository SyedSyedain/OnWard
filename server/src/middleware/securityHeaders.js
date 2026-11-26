/**
 * Security headers for a JSON-only API. Responses are data, never pages, so the
 * policy forbids loading anything and being framed. HSTS only when served over HTTPS.
 */
export function securityHeaders({ https = false } = {}) {
  return (req, res, next) => {
    res.set({
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Cross-Origin-Opener-Policy': 'same-origin',
    });
    if (https) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}
