import { useState, useCallback, useRef } from "react";
import { useEffect } from "react";
import WorldMap from "./components/WorldMap";
import TopBar from "./components/TopBar";
import NewsSidebar from "./components/NewsSidebar";
import SourcesModal from "./components/SourcesModal";
import { useNews } from "./hooks/useNews";

const MOBILE_BREAKPOINT = 768;

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [sortBy, setSortBy] = useState("relevancy");
  const [timeRange, setTimeRange] = useState("7d");
  const [includePoliticalKeywords, setIncludePoliticalKeywords] =
    useState(true);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
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

  // Track current search context for re-filtering
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

  const handleCountryClick = useCallback(
    (countryName) => {
      setSelectedCountry(countryName);
      searchContextRef.current = {
        topic: countryName,
        extraKeywords: "",
        queryOptions: {},
        raw: false,
      };
      search({
        topic: countryName,
        sortBy,
        timeRange,
        raw: false,
        includePoliticalKeywords,
        useTopSourcesOnly,
        page: 1,
        append: false,
      });
    },
    [search, sortBy, timeRange, includePoliticalKeywords, useTopSourcesOnly],
  );

  const handleGlobalSearch = useCallback(
    ({ topic, raw }) => {
      setSelectedCountry(null);
      searchContextRef.current = {
        topic,
        extraKeywords: "",
        queryOptions: {},
        raw: raw ?? true,
      };
      search({
        topic,
        sortBy,
        timeRange,
        raw: raw ?? true,
        includePoliticalKeywords: true,
        useTopSourcesOnly,
        page: 1,
        append: false,
      });
    },
    [search, sortBy, timeRange, useTopSourcesOnly],
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
      searchContextRef.current = {
        topic,
        extraKeywords,
        queryOptions,
        raw: false,
      };
      search({
        topic,
        extraKeywords,
        queryOptions,
        sortBy,
        timeRange,
        raw: false,
        includePoliticalKeywords,
        useTopSourcesOnly,
        page: 1,
        append: false,
      });
    },
    [search, sortBy, timeRange, includePoliticalKeywords, useTopSourcesOnly],
  );

  const handlePoliticalModeChange = useCallback(
    (enabled) => {
      setIncludePoliticalKeywords(enabled);
      if (!selectedCountry) return;
      search({
        topic: selectedCountry,
        sortBy,
        timeRange,
        raw: false,
        includePoliticalKeywords: enabled,
        useTopSourcesOnly,
        page: 1,
        append: false,
      });
    },
    [search, selectedCountry, sortBy, timeRange, useTopSourcesOnly],
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

  const sidebarOpen = loading || articles.length > 0 || !!error || !!meta;

  return (
    <div className="relative w-full h-full overflow-hidden bg-carbon-950">
      {/* Modals */}
      <SourcesModal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
      />

      {/* Map layer — shrinks when sidebar opens */}
      <div
        className="absolute inset-0 transition-all duration-300"
        style={
          isMobile
            ? { top: "56px", bottom: sidebarOpen ? "46%" : "0" }
            : { right: sidebarOpen ? "380px" : "0" }
        }
      >
        <WorldMap
          selectedCountry={selectedCountry}
          onCountryClick={handleCountryClick}
        />
      </div>

      {/* HUD: top search bar */}
      <TopBar
        onSearch={handleGlobalSearch}
        loading={loading}
        meta={meta}
        activeQuery={activeQuery}
        onSourcesClick={() => setShowSourcesModal(true)}
        isMobile={isMobile}
      />

      {/* News sidebar */}
      {sidebarOpen && (
        <NewsSidebar
          articles={articles}
          loading={loading}
          error={error}
          meta={meta}
          selectedCountry={selectedCountry}
          onClose={handleClose}
          onSortChange={handleSortChange}
          onTimeRangeChange={handleTimeRangeChange}
          onExtraSearch={handleExtraSearch}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
          canLoadMore={canLoadMore}
          includePoliticalKeywords={includePoliticalKeywords}
          onPoliticalModeChange={handlePoliticalModeChange}
          sortBy={sortBy}
          timeRange={timeRange}
          useTopSourcesOnly={useTopSourcesOnly}
          onTopSourcesToggle={handleTopSourcesToggle}
          isMobile={isMobile}
        />
      )}

      {/* Bottom HUD bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[998] flex items-center justify-between px-4 py-2 pointer-events-none"
        style={
          isMobile ? { right: "0" } : { right: sidebarOpen ? "380px" : "0" }
        }
      >
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest hidden sm:inline">
            Click any country to monitor
          </span>
          {selectedCountry && (
            <span className="text-[9px] font-mono text-signal-cyan uppercase tracking-widest">
              ◆ {selectedCountry}
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono text-carbon-700 uppercase tracking-widest">
          SENTINEL v1.0 · Global News Monitor
        </span>
      </div>
    </div>
  );
}
