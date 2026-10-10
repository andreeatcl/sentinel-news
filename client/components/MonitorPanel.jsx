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
  englishOnly,
  onEnglishOnlyToggle,
  stateMediaPriority,
  onStateMediaPriorityToggle,
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
    <div className="panel-enter absolute z-[1100] inset-x-3 md:inset-x-[10%] top-16 bottom-3 flex flex-col bg-carbon-900 border border-carbon-800 rounded-xl shadow-panel overflow-hidden">
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
          englishOnly={englishOnly}
          onEnglishOnlyToggle={onEnglishOnlyToggle}
          stateMediaPriority={stateMediaPriority}
          onStateMediaPriorityToggle={onStateMediaPriorityToggle}
          onExtraSearch={onExtraSearch}
          onLoadMore={onLoadMore}
          onSelectArticle={onSelectArticle}
        />
      )}
    </div>
  );
}
