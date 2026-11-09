const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;
const MAX_TRACKED_CLIENTS = 2_000;
const requestsByClient = new Map<string, { count: number; resetAt: number }>();

export function consumePublicAiRequest(clientId: string, now = Date.now()): boolean {
  for (const [key, record] of requestsByClient) {
    if (record.resetAt <= now) requestsByClient.delete(key);
  }

  const current = requestsByClient.get(clientId);
  if (current && current.resetAt > now) {
    if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
    current.count += 1;
    return true;
  }

  if (requestsByClient.size >= MAX_TRACKED_CLIENTS) {
    const oldestKey = requestsByClient.keys().next().value;
    if (oldestKey) requestsByClient.delete(oldestKey);
  }
  requestsByClient.set(clientId, { count: 1, resetAt: now + WINDOW_MS });
  return true;
}
