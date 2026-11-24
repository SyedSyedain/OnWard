/**
 * The only place the client talks to the network.
 * Errors from the API arrive as { error: { code, message } } and are thrown as ApiError.
 */

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? ''}/api`;

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request(method, path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the OnWard server. Is it running?');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const { code = 'UNKNOWN_ERROR', message = 'Something went wrong.' } = data.error ?? {};
    throw new ApiError(response.status, code, message);
  }
  return data;
}
