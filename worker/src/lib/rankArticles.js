import sources from "../../../client/utils/sources.json";

const RECENCY_HALF_LIFE_HOURS = 36;
const RECENCY_FLOOR = 0.05;

const TRUST_MULTIPLIER = 1.3;

const PROVIDER_MULTIPLIER = { newsapi: 1.25, gdelt: 1 };

const NON_ENGLISH_PENALTY = 0.8;

const GEO_KEYWORDS = [
  // war / military / armed conflict
  "war",
  "conflict",
  "military",
  "troop",
  "airstrike",
  "missile",
  "invasion",
  "offensive",
  "ceasefire",
  "casualty",
  "casualties",
  "insurgent",
  "militant",
  "rebel",
  "bombing",
  "bombardment",
  "shelling",
  "artillery",
  "drone",
  "warplane",
  "warship",
  "frontline",
  "combat",
  "siege",
  "occupation",
  "annexation",
  "mobilization",
  "conscription",
  "militia",
  "paramilitary",
  "insurgency",
  "guerrilla",
  "peacekeeping",
  "peacekeeper",
  "arms deal",
  "weapons shipment",
  "war crimes",
  "genocide",
  "ethnic cleansing",
  "displacement",
  "refugee",
  "humanitarian crisis",
  "evacuation",
  "no-fly zone",

  // crime / corruption
  "crime",
  "corruption",
  "arrest",
  "trial",
  "indictment",
  "smuggling",
  "trafficking",
  "cartel",
  "assassination",
  "kidnapping",
  "bribery",
  "fraud",
  "embezzlement",
  "money laundering",
  "organized crime",
  "extradition",
  "manhunt",
  "homicide",
  "terrorism",
  "terrorist",
  "gang violence",
  "black market",
  "prosecutor",
  "convicted",
  "sentenced",
  "scandal",
  "spying",

  // protests / civil unrest
  "protest",
  "riot",
  "unrest",
  "demonstration",
  "uprising",
  "crackdown",
  "clashes",
  "tear gas",
  "curfew",
  "martial law",
  "revolt",
  "rebellion",
  "insurrection",
  "dissent",
  "activist",
  "rally",
  "blockade",
  "general strike",
  "mutiny",

  // international incidents / crises
  "crisis",
  "embassy",
  "hostage",
  "espionage",
  "sanctions",
  "coup",
  "border dispute",
  "territorial dispute",
  "standoff",
  "provocation",
  "incursion",
  "airspace violation",
  "defector",
  "cyberattack",
  "election interference",
  "coup attempt",
  "state of emergency",

  // trade / economic conflict
  "trade deal",
  "tariff",
  "trade war",
  "treaty",
  "embargo",
  "export ban",
  "trade dispute",
  "import ban",
  "export controls",
  "economic sanctions",
  "oil embargo",
  "energy crisis",
  "debt crisis",
  "currency devaluation",

  // diplomacy
  "diplomatic",
  "diplomat",
  "bilateral",
  "summit",
  "foreign ministry",
  "foreign minister",
  "united nations",
  "nato",
  "alliance",
  "negotiation",
  "state visit",
  "envoy",
  "ambassador",
  "peace talks",
  "peace deal",
  "mediation",
  "accord",
  "security council",
  "resolution",
  "veto",
  "arms control",
  "disarmament",
];
const GEO_KEYWORD_BOOST_STEP = 0.12;
const GEO_KEYWORD_BOOST_CAP = 1.6;
const GEO_NO_MATCH_PENALTY = 0.85;

const CORROBORATION_WEIGHT = 0.12;

function normalizeSourceValue(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const trustedNames = new Set(
  sources.sources.map((s) => normalizeSourceValue(s.name)),
);
const trustedDomains = new Set(
  sources.sources.map((s) => hostnameOf(s.url)).filter(Boolean),
);

// works for both NewsAPI articles (name-based) and GDELT articles, which
// only carry a raw domain, not a display name
function isTrustedSource(article) {
  const name = normalizeSourceValue(article?.source?.name || "");
  if (name && trustedNames.has(name)) return true;
  const hostname = hostnameOf(article?.url || "");
  return !!hostname && trustedDomains.has(hostname);
}

function recencyScore(publishedAt) {
  const time = publishedAt ? Date.parse(publishedAt) : NaN;
  if (Number.isNaN(time)) return RECENCY_FLOOR;
  const hoursAgo = Math.max(0, (Date.now() - time) / (60 * 60 * 1000));
  return Math.max(RECENCY_FLOOR, 0.5 ** (hoursAgo / RECENCY_HALF_LIFE_HOURS));
}

function geoRelevanceMultiplier(article) {
  const haystack =
    `${article?.title || ""} ${article?.description || ""}`.toLowerCase();
  let hits = 0;
  for (const term of GEO_KEYWORDS) {
    if (haystack.includes(term)) hits++;
  }
  if (hits === 0) return GEO_NO_MATCH_PENALTY;
  return Math.min(GEO_KEYWORD_BOOST_CAP, 1 + hits * GEO_KEYWORD_BOOST_STEP);
}

function corroborationMultiplier(article) {
  const count = Math.max(1, article?._duplicateCount || 1);
  return 1 + CORROBORATION_WEIGHT * Math.log(count);
}

function providerMultiplier(article) {
  return PROVIDER_MULTIPLIER[article?._provider] ?? PROVIDER_MULTIPLIER.newsapi;
}

function languageMultiplier(article) {
  const language = article?.language;
  if (!language) return 1;
  return language.toLowerCase().includes("english") ? 1 : NON_ENGLISH_PENALTY;
}

function relevanceScore(article) {
  return (
    recencyScore(article.publishedAt) *
    (isTrustedSource(article) ? TRUST_MULTIPLIER : 1) *
    providerMultiplier(article) *
    languageMultiplier(article) *
    geoRelevanceMultiplier(article) *
    corroborationMultiplier(article)
  );
}

function popularityScore(article) {
  return (
    corroborationMultiplier(article) *
    (isTrustedSource(article) ? TRUST_MULTIPLIER : 1) *
    providerMultiplier(article) *
    languageMultiplier(article) *
    (0.5 + 0.5 * recencyScore(article.publishedAt))
  );
}

function dateValue(article) {
  const t = article.publishedAt ? Date.parse(article.publishedAt) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

const SCORERS = {
  relevancy: relevanceScore,
  popularity: popularityScore,
};

export function rankArticles(articles, { sortBy = "relevancy" } = {}) {
  const list = articles || [];
  if (sortBy === "date") {
    return [...list].sort((a, b) => dateValue(b) - dateValue(a));
  }
  const scorer = SCORERS[sortBy] || SCORERS.relevancy;
  return list
    .map((article) => ({ article, score: scorer(article) }))
    .sort((a, b) => b.score - a.score)
    .map(({ article }) => article);
}
