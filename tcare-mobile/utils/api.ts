export function post(url: string, body: object, signal?: AbortSignal): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

/** Bound the entire request, including reading the response body. */
export async function postWithTimeout<T>(url: string, body: object) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await post(url, body, controller.signal);
    const payload: T = await response.json();
    return { response, payload };
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Request timeout');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
