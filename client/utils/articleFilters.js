import sources from "./sources.json";

function normalizeSourceValue(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const topSourceNameSet = new Set(
  sources.sources.map((source) => normalizeSourceValue(source.name)),
);
const topSourceIdSet = new Set(
  sources.sources
    .map((source) => normalizeSourceValue(source.id))
    .filter(Boolean),
);

// filter out retracted/duplicated articles
export function sanitizeArticles(inputArticles) {
  const seen = new Set();
  return (inputArticles || []).filter((article) => {
    const title = article?.title || "";
    const description = article?.description || "";
    const url = article?.url || "";

    if (!url) return false;
    if (seen.has(url)) return false;
    seen.add(url);

    const badTitle = title.trim() === "[Removed]" || title.trim() === "";
    const badDescription = description.trim() === "[Removed]";
    if (badTitle || badDescription) return false;

    return true;
  });
}

export function filterTopSources(inputArticles) {
  return (inputArticles || []).filter((article) => {
    const sourceId = normalizeSourceValue(article?.source?.id || "");
    const sourceName = normalizeSourceValue(article?.source?.name || "");
    return (
      (sourceId && topSourceIdSet.has(sourceId)) ||
      (sourceName && topSourceNameSet.has(sourceName))
    );
  });
}
