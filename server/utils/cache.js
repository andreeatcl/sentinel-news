const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map();

export function getCacheKey(params) {
  return JSON.stringify(params);
}

export function isCacheValid(entry) {
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

export function getCached(cacheKey) {
  if (!cache.has(cacheKey)) return null;
  const entry = cache.get(cacheKey);
  if (!isCacheValid(entry)) {
    cache.delete(cacheKey);
    return null;
  }
  return entry;
}

export function setCached(cacheKey, data) {
  cache.set(cacheKey, { data, timestamp: Date.now() });
}

export function deleteCached(cacheKey) {
  cache.delete(cacheKey);
}

export function getCacheSnapshot() {
  const entries = [];
  cache.forEach((val, key) => {
    const parsed = JSON.parse(key);
    entries.push({
      key: parsed,
      age: Math.round((Date.now() - val.timestamp) / 1000),
      valid: isCacheValid(val),
    });
  });
  return { size: cache.size, entries };
}

export function getCacheSize() {
  return cache.size;
}
