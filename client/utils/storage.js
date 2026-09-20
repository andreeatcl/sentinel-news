// the main purpose of this app rebuild is to prioritize good UX for a mobile user
// since we will not be using a server or a DB but we do want user data persistance...
// their app data will be stored locally in their browser's localStorage

const STORAGE_KEYS = {
  apiKeys: "sentinel.apiKeys",
  favorites: "sentinel.favorites",
  savedSearches: "sentinel.savedSearches",
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

// favorites are saved article links
// kept generic to accommodate for GDELT results
export function getFavorites() {
  return read(STORAGE_KEYS.favorites, []);
}

export function isFavorite(url) {
  return getFavorites().some((item) => item.url === url);
}

export function addFavorite(article) {
  if (!article?.url) return;
  const current = getFavorites();
  if (current.some((item) => item.url === article.url)) return;

  const favorite = {
    id: article.url,
    url: article.url,
    title: article.title || "",
    sourceName: article.source?.name || "",
    type: article.type === "event" ? "event" : "article",
    savedAt: new Date().toISOString(),
  };
  write(STORAGE_KEYS.favorites, [favorite, ...current]);
}

export function removeFavorite(url) {
  const next = getFavorites().filter((item) => item.url !== url);
  write(STORAGE_KEYS.favorites, next);
}

// saved searches remember what params to re-run
export function getSavedSearches() {
  return read(STORAGE_KEYS.savedSearches, []);
}

export function addSavedSearch({ label, topic, extraKeywords, queryOptions }) {
  if (!topic) return;
  const savedSearch = {
    id: `${Date.now()}`,
    label: label || topic,
    topic,
    extraKeywords: extraKeywords || "",
    queryOptions: queryOptions || {},
    createdAt: new Date().toISOString(),
  };
  write(STORAGE_KEYS.savedSearches, [savedSearch, ...getSavedSearches()]);
  return savedSearch;
}

export function removeSavedSearch(id) {
  const next = getSavedSearches().filter((item) => item.id !== id);
  write(STORAGE_KEYS.savedSearches, next);
}

// export/import used to counter Safari's data wipeout
export function exportData() {
  return {
    exportedAt: new Date().toISOString(),
    apiKeys: getApiKeys(),
    favorites: getFavorites(),
    savedSearches: getSavedSearches(),
  };
}

// overwrites current data with data from the imported file
export function importData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("That file doesn't look like a Sentinel backup.");
  }
  if (data.apiKeys) setApiKeys({ ...DEFAULT_API_KEYS, ...data.apiKeys });
  if (Array.isArray(data.favorites))
    write(STORAGE_KEYS.favorites, data.favorites);
  if (Array.isArray(data.savedSearches))
    write(STORAGE_KEYS.savedSearches, data.savedSearches);
}
