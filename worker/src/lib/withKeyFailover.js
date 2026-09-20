import { DAILY_LIMIT, getUsage, hashKey, trackUsage } from "./keys.js";

// status codes to monitor API (key) status
const QUOTA_OR_AUTH_STATUS = new Set([401, 426, 429]);
const QUOTA_OR_AUTH_CODES = new Set([
  "apiKeyDisabled",
  "apiKeyExhausted",
  "apiKeyInvalid",
  "apiKeyMissing",
  "rateLimited",
]);

function isQuotaOrAuthError(response, data) {
  return (
    QUOTA_OR_AUTH_STATUS.has(response.status) ||
    QUOTA_OR_AUTH_CODES.has(data?.code)
  );
}

function buildTryOrder({ primary, backup, lastGood }) {
  const slots = [
    { slot: "primary", key: primary },
    { slot: "backup", key: backup },
  ].filter((s) => s.key);
  if (lastGood === "backup") slots.reverse();
  return slots;
}

export async function withKeyFailover(env, keys, fetchFn) {
  const tryOrder = buildTryOrder(keys);

  if (tryOrder.length === 0) {
    return { error: { status: 400, message: "No API key configured." } };
  }

  let lastError = null;

  for (const { slot, key } of tryOrder) {
    const keyHash = await hashKey(key);
    const usedToday = await getUsage(env, keyHash);
    if (usedToday >= DAILY_LIMIT) {
      lastError = {
        status: 429,
        message: `Your ${slot} key has reached today's request limit.`,
      };
      continue;
    }

    let response, data;
    try {
      ({ response, data } = await fetchFn(key));
    } catch (err) {
      lastError = {
        status: 504,
        message:
          err?.name === "AbortError"
            ? `Your ${slot} key's request to NewsAPI timed out.`
            : `Could not reach NewsAPI using your ${slot} key.`,
      };
      continue;
    }

    if (response.ok && data.status !== "error") {
      const count = await trackUsage(env, keyHash);
      return {
        data,
        keyUsedSlot: slot,
        apiCallsToday: count,
        apiCallsRemaining: Math.max(0, DAILY_LIMIT - count),
      };
    }

    if (isQuotaOrAuthError(response, data)) {
      lastError = {
        status: response.status,
        message: data.message || `Your ${slot} key was rejected.`,
      };
      continue;
    }

    return {
      error: {
        status: response.status,
        message: data.message || "NewsAPI request failed.",
      },
    };
  }

  return {
    error: lastError || { status: 429, message: "All API keys exhausted." },
  };
}
