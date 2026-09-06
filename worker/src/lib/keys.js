export const DAILY_LIMIT = 100; // NewsAPI free-tier daily cap

export async function hashKey(key) {
  const bytes = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export function extractKeys(request) {
  return {
    primary: request.headers.get("X-Newsapi-Key") || "",
    backup: request.headers.get("X-Newsapi-Key-Backup") || "",
    lastGood: request.headers.get("X-Newsapi-Last-Good") || "primary",
  };
}

function usageKvKey(keyHash) {
  const day = new Date().toISOString().slice(0, 10);
  return `usage:${keyHash}:${day}`;
}

export async function getUsage(env, keyHash) {
  const raw = await env.CACHE.get(usageKvKey(keyHash));
  return raw ? parseInt(raw, 10) : 0;
}

export async function trackUsage(env, keyHash) {
  const kvKey = usageKvKey(keyHash);
  const next = (await getUsage(env, keyHash)) + 1;
  // expires after 2 days so old counters clean themselves up
  await env.CACHE.put(kvKey, String(next), { expirationTtl: 60 * 60 * 48 });
  return next;
}
