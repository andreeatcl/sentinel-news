import { useEffect, useState } from "react";
import PanelHeader from "./PanelHeader";
import EventsTab from "./EventsTab";
import ArticlesTab from "./ArticlesTab";

export default function MonitorPanel({
  articles,
  loading,
  loadingMore,
  canLoadMore,
  error,
  meta,
  selectedCountry,
  onClose,
  onApplyArticleFilters,
  articlesSortDir,
  onToggleArticlesSortDir,
  onExtraSearch,
  onLoadMore,
  includePoliticalKeywords,
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
  eventsFilters,
  onEventsFilterChange,
  onLoadMoreEvents,
  onSelectEvent,
  onSelectArticle,
  onOpenArticlesTab,
}) {
  // Events first — it's keyless/free, unlike Articles (NewsAPI, quota-
  // limited), which only fetches once its tab is actually opened.
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    setActiveTab("events");
  }, [selectedCountry]);

  function handleTabClick(tabId) {
    setActiveTab(tabId);
    if (tabId === "articles") onOpenArticlesTab();
  }

  const showEventsTab = activeTab === "events" && !!selectedCountry;

  return (
    <div
      className="sidebar-enter absolute z-[1100] flex flex-col bg-carbon-900 border border-carbon-700/70 rounded-2xl shadow-2xl overflow-hidden"
      style={{ left: "10%", right: "10%", top: "72px", bottom: "16px" }}
    >
      <PanelHeader
        selectedCountry={selectedCountry}
        loading={loading}
        hasArticles={articles.length > 0}
        meta={meta}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        onSaveSearch={onSaveSearch}
        onClose={onClose}
      />

      {showEventsTab ? (
        <EventsTab
          selectedCountry={selectedCountry}
          events={events}
          eventsLoading={eventsLoading}
          eventsLoadingMore={eventsLoadingMore}
          eventsError={eventsError}
          eventsHasMore={eventsHasMore}
          eventsFilters={eventsFilters}
          onEventsFilterChange={onEventsFilterChange}
          onLoadMoreEvents={onLoadMoreEvents}
          onSelectEvent={onSelectEvent}
        />
      ) : (
        <ArticlesTab
          articles={articles}
          loading={loading}
          loadingMore={loadingMore}
          canLoadMore={canLoadMore}
          error={error}
          selectedCountry={selectedCountry}
          sortBy={sortBy}
          timeRange={timeRange}
          includePoliticalKeywords={includePoliticalKeywords}
          articlesSortDir={articlesSortDir}
          onToggleArticlesSortDir={onToggleArticlesSortDir}
          onApplyArticleFilters={onApplyArticleFilters}
          useTopSourcesOnly={useTopSourcesOnly}
          onTopSourcesToggle={onTopSourcesToggle}
          onExtraSearch={onExtraSearch}
          onLoadMore={onLoadMore}
          onSelectArticle={onSelectArticle}
        />
      )}
    </div>
  );
}
