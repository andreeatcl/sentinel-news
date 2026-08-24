import countryKeywords from "./countryKeywords.json";

const BASE = "/api";
const REQUEST_TIMEOUT_MS = 15000;

function normalizeCountryKey(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function resolveCountryKey(countryOrTopic = "") {
  const normalizedCountry = normalizeCountryKey(countryOrTopic);
  const aliases = countryKeywords.aliases || {};
  const resolvedKey = aliases[normalizedCountry] || normalizedCountry;
  return { normalizedCountry, resolvedKey };
}

function quoteKeyword(term) {
  const clean = term.trim();
  if (!clean) return "";
  if (
    clean.includes(" OR ") ||
    clean.includes(" AND ") ||
    clean.includes(" NOT ")
  ) {
    return clean;
  }
  if (clean.includes(" ") && !(clean.startsWith('"') && clean.endsWith('"'))) {
    return `"${clean}"`;
  }
  return clean;
}

function buildKeywordExpression(keywords) {
  const unique = [];
  const seen = new Set();
  for (const keyword of keywords || []) {
    const normalized = normalizeCountryKey(keyword);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(quoteKeyword(keyword));
  }
  return unique.join(" OR ");
}

function toDisplayVariant(normalizedValue) {
  const normalized = normalizeCountryKey(normalizedValue);
  if (!normalized) return "";

  const tokens = normalized.split(" ").filter(Boolean);
  const isSpacedAcronym =
    tokens.length > 1 && tokens.every((token) => token.length === 1);
  if (isSpacedAcronym) {
    return tokens.join("").toUpperCase();
  }

  if (tokens.length === 1 && tokens[0].length <= 3) {
    return tokens[0].toUpperCase();
  }

  return tokens
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function buildCountryExpression(
  countryOrTopic,
  normalizedCountry,
  resolvedKey,
) {
  const aliases = countryKeywords.aliases || {};
  const seen = new Set();
  const variants = [];

  const addVariant = (value) => {
    const normalized = normalizeCountryKey(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    variants.push(toDisplayVariant(value));
  };

  addVariant(countryOrTopic);
  addVariant(resolvedKey);
  addVariant(normalizedCountry);

  for (const [aliasKey, targetKey] of Object.entries(aliases)) {
    if (targetKey === resolvedKey) {
      addVariant(aliasKey);
    }
  }

  const cleanVariants = variants
    .filter(Boolean)
    .map((variant) => quoteKeyword(variant));
  if (cleanVariants.length <= 1) {
    return quoteKeyword(countryOrTopic);
  }

  return `(${cleanVariants.join(" OR ")})`;
}

/**
 * Fetch news articles via the Express proxy.
 * @param {Object} opts
 * @param {string} opts.q - Search query
 * @param {"relevancy"|"popularity"|"publishedAt"} [opts.sortBy]
 * @param {"48h"|"7d"|"30d"} [opts.timeRange]
 * @param {string} [opts.language]
 * @param {number} [opts.pageSize]
 * @param {number} [opts.page]
 * @param {string} [opts.searchIn]
 */
export async function fetchNews({
  q,
  sortBy = "relevancy",
  timeRange = "7d",
  language,
  pageSize = 100,
  page = 1,
  searchIn = "title,description",
}) {
  const params = new URLSearchParams({
    q,
    sortBy,
    pageSize,
    page,
    searchIn,
  });

  if (language) {
    params.set("language", language);
  }

  if (timeRange === "48h") {
    const from = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    params.set("from", from);
  } else if (timeRange === "30d") {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    params.set("from", from);
  } else {
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    params.set("from", from);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${BASE}/news?${params}`, { signal: controller.signal });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}

/**
 * Build query string with optional political keyword modifier.
 * @param {string} countryOrTopic - Base search term
 * @param {string} [extraKeywords] - Additional user-provided keywords
 * @param {boolean} [includePoliticalKeywords] - Include built-in political/war terms
 */
export function buildTopicQuery(
  countryOrTopic,
  extraKeywords = "",
  includePoliticalKeywords = true,
  options = {},
) {
  const { includeCountry = true, overrideCountryKeywords = false } = options;
  const { normalizedCountry, resolvedKey } = resolveCountryKey(countryOrTopic);
  const defaultKeywords = Array.isArray(countryKeywords.default)
    ? countryKeywords.default
    : [];
  const countryExpression = buildCountryExpression(
    countryOrTopic,
    normalizedCountry,
    resolvedKey,
  );

  const countrySpecific = Array.isArray(countryKeywords[normalizedCountry])
    ? countryKeywords[normalizedCountry]
    : Array.isArray(countryKeywords[resolvedKey])
      ? countryKeywords[resolvedKey]
      : [];
  const activeKeywords =
    countrySpecific.length > 0 ? countrySpecific : defaultKeywords;
  const keywordExpr = buildKeywordExpression(activeKeywords);

  const scopedExtra = extraKeywords.trim()
    ? extraKeywords.includes("OR") ||
      extraKeywords.includes("AND") ||
      extraKeywords.includes("NOT")
      ? extraKeywords.trim()
      : extraKeywords
          .split(",")
          .map((item) => quoteKeyword(item))
          .filter(Boolean)
          .join(" OR ")
    : "";

  const parts = [];

  if (includeCountry) {
    parts.push(countryExpression);
  }

  if (includePoliticalKeywords && !overrideCountryKeywords && keywordExpr) {
    parts.push(`(${keywordExpr})`);
  }

  if (scopedExtra) {
    parts.push(`(${scopedExtra})`);
  }

  if (parts.length > 0) {
    return parts.join(" AND ");
  }

  return countryExpression;
}

export function getCountryKeywordOptions(countryOrTopic) {
  const { normalizedCountry, resolvedKey } = resolveCountryKey(countryOrTopic);

  const countrySpecific = Array.isArray(countryKeywords[normalizedCountry])
    ? countryKeywords[normalizedCountry]
    : Array.isArray(countryKeywords[resolvedKey])
      ? countryKeywords[resolvedKey]
      : [];

  const unique = [];
  const seen = new Set();
  for (const keyword of countrySpecific) {
    const normalized = normalizeCountryKey(keyword);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(keyword);
  }

  return unique;
}

/**
 * Format a UTC date string as relative time.
 */
export function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
