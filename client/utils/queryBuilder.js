import countryKeywords from "../../temporary/countryKeywords.json";

// normalize country names to avoid mismatch caused by special characters
function normalizeCountryKey(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

// check for & resolve country key misalignments
function resolveCountryKey(countryOrTopic = "") {
  const normalizedCountry = normalizeCountryKey(countryOrTopic);
  const aliases = countryKeywords.aliases || {};
  const resolvedKey = aliases[normalizedCountry] || normalizedCountry;
  return { normalizedCountry, resolvedKey };
}

// News API query syntax treats bare space as an AND
// therefore multi-word searches must be searcahed as a phrase
export function quoteKeyword(term) {
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

// "denormalize" the cleaned version of country names to ensure correct search results
// ex: "u s a" => "USA"
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

function getCountrySpecificKeywords(normalizedCountry, resolvedKey) {
  if (Array.isArray(countryKeywords[normalizedCountry])) {
    return countryKeywords[normalizedCountry];
  }
  if (Array.isArray(countryKeywords[resolvedKey])) {
    return countryKeywords[resolvedKey];
  }
  return [];
}

function resolveActiveKeywords(normalizedCountry, resolvedKey) {
  const countrySpecific = getCountrySpecificKeywords(
    normalizedCountry,
    resolvedKey,
  );
  if (countrySpecific.length > 0) return countrySpecific;
  return Array.isArray(countryKeywords.default) ? countryKeywords.default : [];
}

function hasBooleanOperator(text) {
  return text.includes("OR") || text.includes("AND") || text.includes("NOT");
}

// check if custom, extra keywords are submitted as a comma-separated list or with boolean logic
// if boolean logic is already applied, no formatting is needed
function buildScopedExtraExpression(extraKeywords) {
  const trimmed = extraKeywords.trim();
  if (!trimmed) return "";
  if (hasBooleanOperator(trimmed)) return trimmed;
  return trimmed
    .split(",")
    .map((item) => quoteKeyword(item))
    .filter(Boolean)
    .join(" OR ");
}

// ensure that search results are not affected by country aliases
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

// build the entire query string for a country
// country name AND default keywords (if enabled) AND extra keywords
export function buildTopicQuery(
  countryOrTopic,
  extraKeywords = "",
  includePoliticalKeywords = true,
  options = {},
) {
  const { includeCountry = true, overrideCountryKeywords = false } = options;
  const { normalizedCountry, resolvedKey } = resolveCountryKey(countryOrTopic);
  const countryExpression = buildCountryExpression(
    countryOrTopic,
    normalizedCountry,
    resolvedKey,
  );
  const keywordExpr = buildKeywordExpression(
    resolveActiveKeywords(normalizedCountry, resolvedKey),
  );
  const scopedExtra = buildScopedExtraExpression(extraKeywords);

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

  return parts.length > 0 ? parts.join(" AND ") : countryExpression;
}

export function getCountryKeywordOptions(countryOrTopic) {
  const { normalizedCountry, resolvedKey } = resolveCountryKey(countryOrTopic);
  const countrySpecific = getCountrySpecificKeywords(
    normalizedCountry,
    resolvedKey,
  );

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
