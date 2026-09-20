import { useEffect, useMemo, useState } from "react";
import { timeAgo } from "../utils/newsApi";
import { getCountryKeywordOptions } from "../utils/queryBuilder";
import KeywordQueryModal from "./KeywordQueryModal";
import ArticleCard, { SkeletonCard } from "./ArticleCard";
import SidebarFilterBar from "./SidebarFilterBar";
import SidebarQueryControls from "./SidebarQueryControls";
import EventsFilterBar from "./EventsFilterBar";
import EventsList from "./EventsList";

export default function NewsSidebar({
  articles,
  loading,
  loadingMore,
  canLoadMore,
  error,
  meta,
  selectedCountry,
  onClose,
  onSortChange,
  onTimeRangeChange,
  onExtraSearch,
  onLoadMore,
  includePoliticalKeywords,
  onPoliticalModeChange,
  sortBy,
  timeRange,
  useTopSourcesOnly,
  onTopSourcesToggle,
  onSaveSearch,
  events,
  eventsLoading,
  eventsLoadingMore,
  eventsError,
  eventsHasMore,
  eventsTimeRange,
  onEventsTimeRangeChange,
  onLoadMoreEvents,
  onSelectEvent,
  onOpenArticlesTab,
  isMobile = false,
}) {
  const [queryPreview, setQueryPreview] = useState("");
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  // Events first — it's keyless/free, unlike Articles (NewsAPI, quota-
  // limited), which only fetches once its tab is actually opened.
  const [activeTab, setActiveTab] = useState("events");
  // Cooldown after each "Load More" click — each additional event costs a
  // subrequest (its headline fetch), so this discourages rapid repeated
  // clicks from bursting a lot of scraping/subrequests at once.
  const EVENTS_LOAD_MORE_COOLDOWN_MS = 4000;
  const [eventsLoadMoreCooldown, setEventsLoadMoreCooldown] = useState(false);

  function handleLoadMoreEventsClick() {
    onLoadMoreEvents();
    setEventsLoadMoreCooldown(true);
    setTimeout(
      () => setEventsLoadMoreCooldown(false),
      EVENTS_LOAD_MORE_COOLDOWN_MS,
    );
  }

  const availableKeywords = useMemo(
    () => (selectedCountry ? getCountryKeywordOptions(selectedCountry) : []),
    [selectedCountry],
  );

  // reset query preview & active tab when switching countries
  useEffect(() => {
    setQueryPreview("");
    setShowKeywordModal(false);
    setActiveTab("events");
  }, [selectedCountry]);

  function handleTabClick(tabId) {
    setActiveTab(tabId);
    if (tabId === "articles") onOpenArticlesTab();
  }

  function handleApplyKeywordQuery({ expression, queryOptions }) {
    const nextExpression = expression || "";
    setQueryPreview(nextExpression);
    if (selectedCountry) {
      onExtraSearch({
        topic: selectedCountry,
        extraKeywords: nextExpression,
        queryOptions,
      });
    }
  }

  function handleSaveSearchClick() {
    onSaveSearch();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  function clearKeywordQuery() {
    setQueryPreview("");
    if (selectedCountry) {
      onExtraSearch({
        topic: selectedCountry,
        extraKeywords: "",
        queryOptions: {},
      });
    }
  }

  return (
    <div
      className={`sidebar-enter absolute z-[999] flex flex-col bg-carbon-900/98 backdrop-blur-md ${
        isMobile
          ? "left-0 right-0 bottom-0 top-[54%] border-t border-carbon-700/70 rounded-t-xl"
          : "top-0 right-0 bottom-0 w-[380px] max-w-[90vw] border-l border-carbon-700/70"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-carbon-700/70 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-amber pulse-dot" />
            )}
            {!loading && articles.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green" />
            )}
            <span className="font-display text-white tracking-widest text-base">
              {selectedCountry || "MONITOR"}
            </span>
          </div>
          {meta && (
            <p className="text-[10px] font-mono text-carbon-500 mt-0.5">
              {meta.totalResults?.toLocaleString()} results
              {meta.cached ? ` · cached ${meta.cacheAge}s ago` : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedCountry && (
            <button
              onClick={handleSaveSearchClick}
              title="Save this search"
              className="text-carbon-500 hover:text-signal-amber transition-colors text-lg leading-none w-8 h-8 flex items-center justify-center"
            >
              {savedFlash ? "✓" : "☆"}
            </button>
          )}
          <button
            onClick={onClose}
            className="text-carbon-500 hover:text-white transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      </div>

      {/* Events / Articles tabs (only meaningful once a country is picked) */}
      {selectedCountry && (
        <div className="flex border-b border-carbon-700/70 shrink-0">
          {[
            { id: "events", label: "Events" },
            { id: "articles", label: "Articles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 text-[10px] font-mono font-bold uppercase tracking-widest py-2.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-signal-cyan text-signal-cyan"
                  : "border-transparent text-carbon-500 hover:text-carbon-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "events" && selectedCountry ? (
        <>
          <EventsFilterBar
            timeRange={eventsTimeRange}
            onTimeRangeChange={onEventsTimeRangeChange}
          />
          <div className="flex-1 overflow-y-auto">
            <EventsList
              events={events}
              loading={eventsLoading}
              error={eventsError}
              onSelectEvent={onSelectEvent}
            />
          </div>
          {events.length > 0 && (
            <div className="shrink-0 px-4 py-2 border-t border-carbon-700/50 space-y-2">
              <p className="text-[9px] font-mono text-carbon-600 text-center uppercase tracking-widest">
                {events.length} events · powered by GDELT
              </p>
              {eventsHasMore && (
                <button
                  onClick={handleLoadMoreEventsClick}
                  disabled={eventsLoadingMore || eventsLoadMoreCooldown}
                  className="w-full text-[10px] font-mono font-bold text-carbon-300 border border-carbon-600/70 rounded px-3 py-1.5 hover:border-signal-cyan/60 hover:text-signal-cyan transition-colors disabled:opacity-40"
                >
                  {eventsLoadingMore
                    ? "LOADING…"
                    : eventsLoadMoreCooldown
                      ? "WAIT A MOMENT…"
                      : "LOAD MORE"}
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <SidebarFilterBar
            sortBy={sortBy}
            onSortChange={onSortChange}
            timeRange={timeRange}
            onTimeRangeChange={onTimeRangeChange}
            useTopSourcesOnly={useTopSourcesOnly}
            onTopSourcesToggle={onTopSourcesToggle}
          />

          {/* Keyword filter (only when country selected) */}
          {selectedCountry && (
            <SidebarQueryControls
              queryPreview={queryPreview}
              includePoliticalKeywords={includePoliticalKeywords}
              onOpenKeywordBuilder={() => setShowKeywordModal(true)}
              onPoliticalModeChange={onPoliticalModeChange}
              onClearQuery={clearKeywordQuery}
            />
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <span className="text-signal-red font-mono text-sm mb-2">
                  ⚠ SIGNAL LOST
                </span>
                <p className="text-carbon-500 text-xs font-mono">{error}</p>
              </div>
            )}

            {!loading && !error && articles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <span className="text-carbon-600 font-mono text-xs uppercase tracking-widest">
                  No articles found
                </span>
                <p className="text-carbon-600 text-[10px] font-mono mt-2">
                  Try adjusting the time range or keywords
                </p>
              </div>
            )}

            {!loading &&
              articles.map((article, i) => (
                <ArticleCard
                  key={article.url || i}
                  article={article}
                  index={i}
                />
              ))}
          </div>

          {/* Footer */}
          {articles.length > 0 && (
            <div className="shrink-0 px-4 py-2 border-t border-carbon-700/50 space-y-2">
              <p className="text-[9px] font-mono text-carbon-600 text-center uppercase tracking-widest">
                {articles.length} loaded · powered by NewsAPI
              </p>
              {canLoadMore && (
                <button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="w-full text-[10px] font-mono font-bold text-carbon-300 border border-carbon-600/70 rounded px-3 py-1.5 hover:border-signal-cyan/60 hover:text-signal-cyan transition-colors disabled:opacity-40"
                >
                  {loadingMore ? "LOADING…" : "SEE MORE"}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <KeywordQueryModal
        isOpen={showKeywordModal && !!selectedCountry}
        countryName={selectedCountry}
        availableKeywords={availableKeywords}
        onApply={handleApplyKeywordQuery}
        onClose={() => setShowKeywordModal(false)}
      />
    </div>
  );
}
