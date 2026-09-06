// the main purpose of this app rebuild is to prioritize good UX for a mobile user
// since we will not be using a server or a DB but we do want user data persistance...
// their app data will be stored locally in their browser's localStorage

const STORAGE_KEYS = {
  apiKeys: "sentinel.apiKeys",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable/full
  }
}

const DEFAULT_API_KEYS = { primary: "", backup: "", lastGood: "primary" };

export function getApiKeys() {
  return { ...DEFAULT_API_KEYS, ...read(STORAGE_KEYS.apiKeys, {}) };
}

export function setApiKeys(keys) {
  write(STORAGE_KEYS.apiKeys, keys);
}

export function hasAnyApiKey() {
  const { primary, backup } = getApiKeys();
  return Boolean(primary || backup);
}
