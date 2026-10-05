export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

/**
 * Wraps fetch for the JSON endpoints. The server returns a JSON body even on
 * error, so callers read `data.message` for the reason instead of the status.
 */
export async function apiRequest<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(input, init);
  const data = (await response.json().catch(() => null)) as T | null;
  return { ok: response.ok, status: response.status, data };
}

export function jsonBody(payload: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}
