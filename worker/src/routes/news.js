import { Hono } from "hono";
import {
  fetchEverything,
  fetchTopHeadlines,
} from "../services/newsApiService.js";
import { getCacheKey, getCached, setCached } from "../lib/cache.js";
import { extractKeys } from "../lib/keys.js";
import { withKeyFailover } from "../lib/withKeyFailover.js";
import {
  buildGdeltDocQuery,
  fetchGdeltDoc,
  normalizeGdeltArticle,
} from "../services/gdeltDocService.js";
import { mergeArticles } from "../lib/mergeArticles.js";

// NewsAPI offers news with a 24h delay so refetching more than a few times a day will just be useless & burn our daily quota
const CACHE_TTL_SECONDS = 60 * 60 * 6;

const news = new Hono();

// fetches GDELT DOC results for a topic and merges them into NewsAPI's article list
async function mergeInGdeltDoc(newsApiData, topic, from) {
  if (!topic) return newsApiData;

  try {
    const query = buildGdeltDocQuery(topic);
    const { articles: gdeltRaw } = await fetchGdeltDoc({ query, from });
    const gdeltArticles = gdeltRaw.map(normalizeGdeltArticle);
    const merged = mergeArticles(newsApiData.articles || [], gdeltArticles);
    return { ...newsApiData, articles: merged, totalResults: merged.length };
  } catch {
    return newsApiData;
  }
}

news.get("/news", async (c) => {
  const {
    q,
    topic,
    sortBy = "relevancy",
    from,
    language,
    pageSize = "100",
    page = "1",
    searchIn = "title,description",
  } = c.req.query();

  if (!q) {
    return c.json({ error: "Query parameter q is required" }, 400);
  }

  const keys = extractKeys(c.req.raw);
  if (!keys.primary && !keys.backup) {
    return c.json(
      { error: "No API key configured. Add one in Settings." },
      400,
    );
  }

  const params = { q, topic, sortBy, from, language, pageSize, page, searchIn };
  const cacheKey = getCacheKey(params);

  const cached = await getCached(c.env, cacheKey);
  if (cached) {
    return c.json({
      ...cached.data,
      _cached: true,
      _cacheAge: Math.round((Date.now() - cached.timestamp) / 1000),
    });
  }

  const result = await withKeyFailover(c.env, keys, (apiKey) =>
    fetchEverything({
      apiKey,
      q,
      sortBy,
      from,
      language,
      pageSize,
      page,
      searchIn,
    }),
  );

  if (result.error) {
    return c.json({ error: result.error.message }, result.error.status);
  }

  const mergedData = await mergeInGdeltDoc(result.data, topic, from);

  await setCached(c.env, cacheKey, mergedData, CACHE_TTL_SECONDS);

  return c.json({
    ...mergedData,
    _cached: false,
    _keyUsed: result.keyUsedSlot,
    _apiCallsToday: result.apiCallsToday,
    _apiCallsRemaining: result.apiCallsRemaining,
  });
});

// test submitted API key
news.get("/keys/test", async (c) => {
  const key = c.req.header("X-Newsapi-Key");
  if (!key) {
    return c.json({ valid: false, message: "No key provided." }, 400);
  }

  try {
    const { response, data } = await fetchTopHeadlines({
      apiKey: key,
      country: "us",
      pageSize: 1,
    });
    if (response.ok && data.status !== "error") {
      return c.json({ valid: true });
    }
    return c.json({ valid: false, message: data.message || "Key rejected." });
  } catch {
    return c.json({ valid: false, message: "Could not reach NewsAPI." }, 502);
  }
});

export default news;
