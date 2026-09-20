import { useState, useCallback, useRef, useEffect } from "react";
import { useNews } from "./useNews";
import { useEvents } from "./useEvents";

const MOBILE_BREAKPOINT = 768;

export function useAppControls() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [sortBy, setSortBy] = useState("relevancy");
  const [timeRange, setTimeRange] = useState("7d");
  const [eventsTimeRange, setEventsTimeRange] = useState("7d");
  const [includePoliticalKeywords, setIncludePoliticalKeywords] =
    useState(true);
  const [useTopSourcesOnly, setUseTopSourcesOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false,
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // avoid redundant double search when loading more news
  const searchContextRef = useRef({
    topic: null,
    extraKeywords: "",
    queryOptions: {},
    raw: false,
  });
  // tracks whether the NewsAPI search has actually fired for the current country yet
  const articlesFetchedRef = useRef(false);

  const {
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
    setTopSourcesOnly: applyTopSourcesFilter,
    clear,
  } = useNews();

  const {
    events,
    loading: eventsLoading,
    loadingMore: eventsLoadingMore,
    error: eventsError,
    hasMore: eventsHasMore,
    search: searchEvents,
    loadMore: loadMoreEvents,
    clear: clearEvents,
  } = useEvents();

  const runSearch = useCallback(
    ({
      topic,
      extraKeywords = "",
      queryOptions = {},
      raw = false,
      includePoliticalKeywords: political = includePoliticalKeywords,
    }) => {
      searchContextRef.current = { topic, extraKeywords, queryOptions, raw };
      search({
        topic,
        extraKeywords,
        queryOptions,
        raw,
        sortBy,
        timeRange,
        includePoliticalKeywords: political,
        useTopSourcesOnly,
        page: 1,
        append: false,
      });
    },
    [search, sortBy, timeRange, includePoliticalKeywords, useTopSourcesOnly],
  );

  const handleCountryClick = useCallback(
    (countryName) => {
      setSelectedCountry(countryName);
      searchContextRef.current = {
        topic: countryName,
        extraKeywords: "",
        queryOptions: {},
        raw: false,
      };
      articlesFetchedRef.current = false;
      searchEvents(countryName, eventsTimeRange);
    },
    [searchEvents, eventsTimeRange],
  );

  const handleOpenArticlesTab = useCallback(() => {
    if (articlesFetchedRef.current || !selectedCountry) return;
    articlesFetchedRef.current = true;
    runSearch({ topic: selectedCountry });
  }, [runSearch, selectedCountry]);

  // country-less global search
  const handleGlobalSearch = useCallback(
    ({ topic, raw }) => {
      setSelectedCountry(null);
      articlesFetchedRef.current = true;
      runSearch({ topic, raw: raw ?? true, includePoliticalKeywords: true });
      clearEvents();
    },
    [runSearch, clearEvents],
  );

  const handleEventsTimeRangeChange = useCallback(
    (newRange) => {
      setEventsTimeRange(newRange);
      if (selectedCountry) searchEvents(selectedCountry, newRange);
    },
    [searchEvents, selectedCountry],
  );

  const handleSortChange = useCallback(
    (newSort) => {
      setSortBy(newSort);
      resort(newSort, timeRange);
    },
    [resort, timeRange],
  );

  const handleTimeRangeChange = useCallback(
    (newRange) => {
      setTimeRange(newRange);
      resort(sortBy, newRange);
    },
    [resort, sortBy],
  );

  const handleExtraSearch = useCallback(
    ({ topic, extraKeywords, queryOptions = {} }) => {
      runSearch({ topic, extraKeywords, queryOptions });
    },
    [runSearch],
  );

  const handlePoliticalModeChange = useCallback(
    (enabled) => {
      setIncludePoliticalKeywords(enabled);
      if (!selectedCountry) return;
      runSearch({ topic: selectedCountry, includePoliticalKeywords: enabled });
    },
    [runSearch, selectedCountry],
  );

  const handleClose = useCallback(() => {
    setSelectedCountry(null);
    articlesFetchedRef.current = false;
    clear();
    clearEvents();
  }, [clear, clearEvents]);

  const handleLoadMore = useCallback(() => {
    loadMore(sortBy, timeRange);
  }, [loadMore, sortBy, timeRange]);

  const handleTopSourcesToggle = useCallback(() => {
    const newState = !useTopSourcesOnly;
    setUseTopSourcesOnly(newState);
    applyTopSourcesFilter(newState);
  }, [useTopSourcesOnly, applyTopSourcesFilter]);

  // re-run a search saved earlier (see SavedSearchesPanel.jsx)
  const handleRunSavedSearch = useCallback(
    ({ topic, extraKeywords, queryOptions }) => {
      setSelectedCountry(topic);
      articlesFetchedRef.current = true;
      runSearch({ topic, extraKeywords, queryOptions });
      searchEvents(topic, eventsTimeRange);
    },
    [runSearch, searchEvents, eventsTimeRange],
  );

  const getCurrentSearch = useCallback(
    () => ({ ...searchContextRef.current }),
    [],
  );

  return {
    selectedCountry,
    sortBy,
    timeRange,
    includePoliticalKeywords,
    useTopSourcesOnly,
    isMobile,
    articles,
    loading,
    loadingMore,
    canLoadMore,
    error,
    meta,
    activeQuery,
    events,
    eventsLoading,
    eventsLoadingMore,
    eventsError,
    eventsHasMore,
    eventsTimeRange,
    handleCountryClick,
    handleGlobalSearch,
    handleOpenArticlesTab,
    handleSortChange,
    handleTimeRangeChange,
    handleEventsTimeRangeChange,
    handleLoadMoreEvents: loadMoreEvents,
    handleExtraSearch,
    handlePoliticalModeChange,
    handleClose,
    handleLoadMore,
    handleTopSourcesToggle,
    handleRunSavedSearch,
    getCurrentSearch,
  };
}
