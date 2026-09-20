// de-duplicate articles and merge chronologically

function normalizeTitle(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function mergeArticles(newsApiArticles = [], gdeltArticles = []) {
  const tagged = [
    ...newsApiArticles.map((a) => ({
      ...a,
      _provider: a._provider || "newsapi",
    })),
    ...gdeltArticles,
  ];

  const seenUrls = new Set();
  const seenTitles = new Set();
  const deduped = [];

  for (const article of tagged) {
    const url = article.url || "";
    const titleKey = normalizeTitle(article.title);
    if (!url || seenUrls.has(url)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;

    seenUrls.add(url);
    if (titleKey) seenTitles.add(titleKey);
    deduped.push(article);
  }

  return deduped.sort(
    (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0),
  );
}
