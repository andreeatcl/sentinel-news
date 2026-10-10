// the main purpose of this app rebuild is to prioritize good UX for a mobile user
// since we will not be using a server or a DB but we do want user data persistance...
// their app data will be stored locally in their browser's localStorage

const STORAGE_KEYS = {
  apiKeys: "sentinel.apiKeys",
  favorites: "sentinel.favorites",
  favoriteGroups: "sentinel.favoriteGroups",
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

/// favorites are saved article/event links
export function getFavorites() {
  return read(STORAGE_KEYS.favorites, []);
}

export function isFavorite(url) {
  return getFavorites().some((item) => item.url === url);
}

export function addFavorite(favorite) {
  if (!favorite?.url) return;
  const current = getFavorites();
  if (current.some((item) => item.url === favorite.url)) return;

  const entry = {
    ...favorite,
    id: favorite.url,
    type: favorite.type === "event" ? "event" : "article",
    savedAt: new Date().toISOString(),
  };
  write(STORAGE_KEYS.favorites, [entry, ...current]);
}

// undo for a removal — puts the item back where it was
export function restoreFavorite(favorite, index) {
  const current = getFavorites();
  if (current.some((item) => item.url === favorite.url)) return;
  const next = [...current];
  next.splice(Math.min(index, next.length), 0, favorite);
  write(STORAGE_KEYS.favorites, next);
}

export function removeFavorite(url) {
  const next = getFavorites().filter((item) => item.url !== url);
  write(STORAGE_KEYS.favorites, next);
}

// user-made groups of favorites ({ id, name, urls, createdAt })
// membership is by url and survives un-favoriting, so undo and re-saving keep it
export function getFavoriteGroups() {
  return read(STORAGE_KEYS.favoriteGroups, []);
}

function updateFavoriteGroups(update) {
  const next = update(getFavoriteGroups());
  write(STORAGE_KEYS.favoriteGroups, next);
  return next;
}

export function createFavoriteGroup(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const group = {
    id: `${Date.now()}`,
    name: trimmed,
    urls: [],
    createdAt: new Date().toISOString(),
  };
  updateFavoriteGroups((groups) => [...groups, group]);
  return group;
}

export function renameFavoriteGroup(id, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  updateFavoriteGroups((groups) =>
    groups.map((g) => (g.id === id ? { ...g, name: trimmed } : g)),
  );
}

export function deleteFavoriteGroup(id) {
  updateFavoriteGroups((groups) => groups.filter((g) => g.id !== id));
}

export function setFavoriteGroupMembership(id, url, isMember) {
  updateFavoriteGroups((groups) =>
    groups.map((g) => {
      if (g.id !== id) return g;
      const urls = g.urls.filter((u) => u !== url);
      return { ...g, urls: isMember ? [...urls, url] : urls };
    }),
  );
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
    favoriteGroups: getFavoriteGroups(),
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
  if (Array.isArray(data.favoriteGroups))
    write(STORAGE_KEYS.favoriteGroups, data.favoriteGroups);
  if (Array.isArray(data.savedSearches))
    write(STORAGE_KEYS.savedSearches, data.savedSearches);
}
