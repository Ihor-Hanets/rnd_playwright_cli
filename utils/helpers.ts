import { APIRequestContext } from '@playwright/test';

/**
 * Makes an authenticated GET request and returns the parsed JSON body.
 */
export async function apiGet<T>(
  request: APIRequestContext,
  path: string,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await request.get(path, { headers });
  if (!response.ok()) {
    throw new Error(`GET ${path} failed: ${response.status()} ${response.statusText()}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Waits for a condition to be truthy, polling every `intervalMs` ms.
 */
export async function waitFor(
  condition: () => Promise<boolean> | boolean,
  timeoutMs = 10_000,
  intervalMs = 500,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Returns a random alphanumeric string of the given length.
 */
export function randomString(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Formats a Date to YYYY-MM-DD.
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
