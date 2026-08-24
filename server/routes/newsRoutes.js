import { Router } from "express";
import {
  fetchEverything,
  fetchTopHeadlines,
} from "../services/newsApiService.js";
import { getCacheKey, getCached, setCached } from "../utils/cache.js";
import { getApiCallsToday, trackApiCall } from "../utils/apiUsage.js";

export default function createNewsRoutes({ newsApiKey }) {
  const router = Router();

  router.get("/news", async (req, res) => {
    const {
      q,
      sortBy = "relevancy",
      from,
      language,
      pageSize = 100,
      page = 1,
      searchIn = "title,description",
    } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query parameter q is required" });
    }

    if (!newsApiKey) {
      return res
        .status(500)
        .json({ error: "NEWS_API_KEY not configured on server" });
    }

    const params = {
      q,
      sortBy,
      from,
      ...(language ? { language } : {}),
      pageSize,
      page,
      searchIn,
    };
    const cacheKey = getCacheKey(params);

    const cachedEntry = getCached(cacheKey);
    if (cachedEntry) {
      console.log(`[CACHE HIT] ${cacheKey.substring(0, 80)}`);
      return res.json({
        ...cachedEntry.data,
        _cached: true,
        _cacheAge: Math.round((Date.now() - cachedEntry.timestamp) / 1000),
        _apiCallsToday: getApiCallsToday(),
      });
    }

    try {
      const { response, data, url } = await fetchEverything({
        apiKey: newsApiKey,
        q,
        sortBy,
        from,
        language,
        pageSize,
        page,
        searchIn,
      });

      console.log(
        `[API CALL #${getApiCallsToday() + 1}] ${url.toString().replace(newsApiKey, "***")}`,
      );
      trackApiCall();

      if (!response.ok || data.status === "error") {
        return res.status(response.status).json({
          error: data.message || "NewsAPI request failed",
          code: data.code,
        });
      }

      setCached(cacheKey, data);

      res.json({
        ...data,
        _cached: false,
        _apiCallsToday: getApiCallsToday(),
      });
    } catch (err) {
      console.error("[FETCH ERROR]", err);
      res.status(500).json({ error: "Failed to reach NewsAPI" });
    }
  });

  router.get("/headlines", async (req, res) => {
    const { country = "us", category = "general", pageSize = 10 } = req.query;

    if (!newsApiKey) {
      return res
        .status(500)
        .json({ error: "NEWS_API_KEY not configured on server" });
    }

    const cacheKey = getCacheKey({
      type: "headlines",
      country,
      category,
      pageSize,
    });

    const cachedEntry = getCached(cacheKey);
    if (cachedEntry) {
      return res.json({
        ...cachedEntry.data,
        _cached: true,
        _apiCallsToday: getApiCallsToday(),
      });
    }

    try {
      trackApiCall();
      const { response, data } = await fetchTopHeadlines({
        apiKey: newsApiKey,
        country,
        category,
        pageSize,
      });

      if (!response.ok || data.status === "error") {
        return res
          .status(response.status)
          .json({ error: data.message, code: data.code });
      }

      setCached(cacheKey, data);
      res.json({ ...data, _cached: false, _apiCallsToday: getApiCallsToday() });
    } catch {
      res.status(500).json({ error: "Failed to reach NewsAPI" });
    }
  });

  return router;
}
