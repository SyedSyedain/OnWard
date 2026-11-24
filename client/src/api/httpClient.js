/**
 * The only place the client talks to the network.
 * Errors from the API arrive as { error: { code, message } } and are thrown as ApiError.
 *
 * The API runs on a free host that sleeps when idle and takes up to a minute to wake.
 * So a request that cannot connect, or gets a 502/503/504 from the host, is retried for
 * about 75 seconds, and anything slower than a few seconds tells the app to show a
 * "waking up" note (see onServerWaking).
 */

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`;
const RETRY_DELAYS_MS = [2000, 4000, 6000, 8000, 10000, 15000, 15000, 15000];
const SLOW_AFTER_MS = 3500;
const WAKING_STATUSES = new Set([502, 503, 504]);

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ── the "server is waking up" signal ──

const wakingListeners = new Set();
const AWAKE_FOR_MS = 10 * 60 * 1000;
let slowRequests = 0;
let lastResponseAt = 0;

/** Calls `listener(true)` while any request is waiting on a sleeping server, and `listener(false)` after. */
export function onServerWaking(listener) {
  wakingListeners.add(listener);
  return () => wakingListeners.delete(listener);
}

/**
 * Counts a request as "waiting on a waking server" when it is slow and the server has not answered
 * in the last ten minutes, or as soon as it has to retry. A slow AI reply from an awake server is not counted.
 */
function trackSlow() {
  let counted = false;
  const count = () => {
    if (counted) return;
    counted = true;
    slowRequests += 1;
    if (slowRequests === 1) wakingListeners.forEach((listener) => listener(true));
  };
  const timer = setTimeout(() => {
    if (Date.now() - lastResponseAt > AWAKE_FOR_MS) count();
  }, SLOW_AFTER_MS);
  return {
    retrying: count,
    done() {
      clearTimeout(timer);
      if (!counted) return;
      slowRequests -= 1;
      if (slowRequests === 0) wakingListeners.forEach((listener) => listener(false));
    },
  };
}

/** Starts the API waking up without waiting for it, so it is ready by the time someone clicks. */
export function wakeServer() {
  fetch(`${BASE_URL}/health`, { cache: 'no-store' })
    .then((response) => {
      if (response.ok) lastResponseAt = Date.now();
    })
    .catch(() => {});
}

// ── requests ──

export async function request(method, path, body) {
  const slow = trackSlow();
  try {
    const response = await fetchWithRetry(method, path, body, slow.retrying);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const { code = 'UNKNOWN_ERROR', message = 'Something went wrong.' } = data.error ?? {};
      throw new ApiError(response.status, code, message);
    }
    return data;
  } finally {
    slow.done();
  }
}

async function fetchWithRetry(method, path, body, onRetry) {
  for (let attempt = 0; ; attempt += 1) {
    let response = null;
    try {
      response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // Could not connect: the server may be asleep or restarting.
    }
    const retryable = !response || WAKING_STATUSES.has(response.status);
    if (!retryable) {
      lastResponseAt = Date.now();
      return response;
    }
    onRetry();
    if (attempt >= RETRY_DELAYS_MS.length) {
      if (response) return response;
      throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the OnWard server right now. Please try again in a minute.');
    }
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }
}
