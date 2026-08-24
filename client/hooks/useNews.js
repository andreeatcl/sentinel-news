import { useState, useCallback, useRef } from "react";
import { fetchNews, buildTopicQuery } from "../utils/newsApi";
import sources from "../utils/sources.json";

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

export function useNews() {
  const [allArticles, setAllArticles] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  // activeQuery is the final built query string shown in the HUD
  const [activeQuery, setActiveQuery] = useState("");
  // rawTopic stores the original topic/country so sort & time range changes
  // can re-search without double-wrapping political keywords
  const rawTopicRef = useRef("");
  const extraKeywordsRef = useRef("");
  const isRawRef = useRef(false);
  const includePoliticalKeywordsRef = useRef(true);
  const queryOptionsRef = useRef({});
  const useTopSourcesOnlyRef = useRef(false);
  const pageRef = useRef(1);

  function sanitizeArticles(inputArticles) {
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

  function filterTopSources(inputArticles) {
    if (!useTopSourcesOnlyRef.current) return inputArticles;
    return (inputArticles || []).filter((article) => {
      const sourceId = normalizeSourceValue(article?.source?.id || "");
      const sourceName = normalizeSourceValue(article?.source?.name || "");
      return (
        (sourceId && topSourceIdSet.has(sourceId)) ||
        (sourceName && topSourceNameSet.has(sourceName))
      );
    });
  }

  const search = useCallback(
    async ({
      topic,
      extraKeywords = "",
      sortBy = "relevancy",
      timeRange = "7d",
      raw = false,
      includePoliticalKeywords = true,
      queryOptions = {},
      useTopSourcesOnly = false,
      page = 1,
      append = false,
    }) => {
      // Persist for re-searches triggered by filter changes
      rawTopicRef.current = topic;
      extraKeywordsRef.current = extraKeywords;
      isRawRef.current = raw;
      includePoliticalKeywordsRef.current = includePoliticalKeywords;
      queryOptionsRef.current = queryOptions;
      useTopSourcesOnlyRef.current = useTopSourcesOnly;

      pageRef.current = page;
      const q = raw
        ? topic
        : buildTopicQuery(
            topic,
            extraKeywords,
            includePoliticalKeywords,
            queryOptions,
          );
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }
      setActiveQuery(q);
      try {
        const data = await fetchNews({ q, sortBy, timeRange, page });
        const nextArticles = sanitizeArticles(data.articles || []);
        setAllArticles((prev) => {
          const nextAll = append
            ? sanitizeArticles([...prev, ...nextArticles])
            : nextArticles;
          setArticles(filterTopSources(nextAll));
          return nextAll;
        });
        setMeta({
          totalResults: data.totalResults,
          cached: data._cached,
          cacheAge: data._cacheAge,
          apiCallsToday: data._apiCallsToday,
          page,
          pageSize: 100,
        });
      } catch (err) {
        setError(err.message);
        if (!append) {
          setAllArticles([]);
          setArticles([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  // Re-search with new sortBy, preserving current topic & raw flag
  const resort = useCallback(
    (sortBy, timeRange) => {
      if (!rawTopicRef.current) return;
      search({
        topic: rawTopicRef.current,
        extraKeywords: extraKeywordsRef.current,
        sortBy,
        timeRange,
        raw: isRawRef.current,
        includePoliticalKeywords: includePoliticalKeywordsRef.current,
        queryOptions: queryOptionsRef.current,
        useTopSourcesOnly: useTopSourcesOnlyRef.current,
        page: 1,
        append: false,
      });
    },
    [search],
  );

  const loadMore = useCallback(
    (sortBy, timeRange) => {
      if (!rawTopicRef.current || loading || loadingMore) return;
      const nextPage = pageRef.current + 1;
      search({
        topic: rawTopicRef.current,
        extraKeywords: extraKeywordsRef.current,
        sortBy,
        timeRange,
        raw: isRawRef.current,
        includePoliticalKeywords: includePoliticalKeywordsRef.current,
        queryOptions: queryOptionsRef.current,
        useTopSourcesOnly: useTopSourcesOnlyRef.current,
        page: nextPage,
        append: true,
      });
    },
    [search, loading, loadingMore],
  );

  const clear = useCallback(() => {
    setAllArticles([]);
    setArticles([]);
    setMeta(null);
    setActiveQuery("");
    setError(null);
    rawTopicRef.current = "";
    extraKeywordsRef.current = "";
    isRawRef.current = false;
    includePoliticalKeywordsRef.current = true;
    queryOptionsRef.current = {};
    useTopSourcesOnlyRef.current = false;
    pageRef.current = 1;
  }, []);

  const setTopSourcesOnly = useCallback(
    (enabled) => {
      useTopSourcesOnlyRef.current = enabled;
      setArticles(enabled ? filterTopSources(allArticles) : allArticles);
    },
    [allArticles],
  );

  const totalForApi = Math.min(meta?.totalResults ?? 0, 100);
  const canLoadMore =
    allArticles.length > 0 && allArticles.length < totalForApi;

  return {
    articles,
    loading,
    loadingMore,
    canLoadMore,
    error,
    meta,
    activeQuery,
    search,
    resort,
    loadMore,
    setTopSourcesOnly,
    clear,
  };
}
