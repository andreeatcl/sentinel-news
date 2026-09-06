import { useState, useCallback, useRef, useEffect } from "react";
import { useNews } from "./useNews";

const MOBILE_BREAKPOINT = 768;

export function useAppControls() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [sortBy, setSortBy] = useState("relevancy");
  const [timeRange, setTimeRange] = useState("7d");
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
      runSearch({ topic: countryName });
    },
    [runSearch],
  );

  // country-less global search
  const handleGlobalSearch = useCallback(
    ({ topic, raw }) => {
      setSelectedCountry(null);
      runSearch({ topic, raw: raw ?? true, includePoliticalKeywords: true });
    },
    [runSearch],
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
    clear();
  }, [clear]);

  const handleLoadMore = useCallback(() => {
    loadMore(sortBy, timeRange);
  }, [loadMore, sortBy, timeRange]);

  const handleTopSourcesToggle = useCallback(() => {
    const newState = !useTopSourcesOnly;
    setUseTopSourcesOnly(newState);
    applyTopSourcesFilter(newState);
  }, [useTopSourcesOnly, applyTopSourcesFilter]);

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
    handleCountryClick,
    handleGlobalSearch,
    handleSortChange,
    handleTimeRangeChange,
    handleExtraSearch,
    handlePoliticalModeChange,
    handleClose,
    handleLoadMore,
    handleTopSourcesToggle,
  };
}
