import countryKeywords from "../../../temporary/countryKeywords.json";

const GDELT_DOC_BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
const MAX_KEYWORDS = 12; // keeps the query under GDELT's length limit
const MAX_RECORDS = 75;

function normalizeCountryKey(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
}

function quotePhrase(term) {
  const clean = term.trim();
  if (!clean) return "";
  return clean.includes(" ") ? `"${clean}"` : clean;
}

export function buildGdeltDocQuery(countryOrTopic) {
  const normalized = normalizeCountryKey(countryOrTopic);
  const aliases = countryKeywords.aliases || {};
  const resolvedKey = aliases[normalized] || normalized;
  const countryPhrase = quotePhrase(countryOrTopic);

  const keywords = Array.isArray(countryKeywords[normalized])
    ? countryKeywords[normalized]
    : Array.isArray(countryKeywords[resolvedKey])
      ? countryKeywords[resolvedKey]
      : [];

  if (keywords.length === 0) return countryPhrase;

  const keywordGroup = keywords
    .slice(0, MAX_KEYWORDS)
    .map(quotePhrase)
    .filter(Boolean)
    .join(" OR ");

  return `${countryPhrase} (${keywordGroup})`;
}

// GDELT wants a "YYYYMMDDHHMMSS" format
function isoToGdeltDateTime(iso) {
  const digits = iso.replace(/[-:TZ]/g, "").replace(/\.\d+$/, "");
  return digits.slice(0, 14).padEnd(14, "0");
}

export async function fetchGdeltDoc({ query, from }) {
  const url = new URL(GDELT_DOC_BASE);
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "artlist");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", String(MAX_RECORDS));
  url.searchParams.set("sort", "datedesc");
  if (from) {
    url.searchParams.set("startdatetime", isoToGdeltDateTime(from));
    url.searchParams.set(
      "enddatetime",
      isoToGdeltDateTime(new Date().toISOString()),
    );
  }

  const response = await fetch(url.toString());
  if (!response.ok) return { articles: [] };

  const data = await response.json().catch(() => ({ articles: [] }));
  return { articles: data.articles || [] };
}

// reformat GDELT format to standard ISO
function seendateToIso(seendate) {
  if (!seendate || seendate.length < 15) return null;
  const y = seendate.slice(0, 4);
  const mo = seendate.slice(4, 6);
  const d = seendate.slice(6, 8);
  const h = seendate.slice(9, 11);
  const mi = seendate.slice(11, 13);
  const s = seendate.slice(13, 15);
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}

export function normalizeGdeltArticle(article) {
  return {
    source: { id: null, name: article.domain || "" },
    author: null,
    title: article.title || "",
    description: null,
    url: article.url,
    urlToImage: article.socialimage || null,
    publishedAt: seendateToIso(article.seendate),
    language: article.language || null,
    sourceCountry: article.sourcecountry || null,
    _provider: "gdelt",
  };
}
