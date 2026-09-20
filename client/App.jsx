import { useState } from "react";
import WorldMap from "./components/WorldMap";
import TopBar from "./components/TopBar";
import MonitorPanel from "./components/MonitorPanel";
import SourcesModal from "./components/SourcesModal";
import ApiKeysModal from "./components/ApiKeysModal";
import FavoritesPanel from "./components/FavoritesPanel";
import SavedSearchesPanel from "./components/SavedSearchesPanel";
import DataBackupModal from "./components/DataBackupModal";
import EventDetail from "./components/EventDetail";
import ArticleDetail from "./components/ArticleDetail";
import { useAppControls } from "./hooks/useAppControls";
import { hasAnyApiKey, addSavedSearch } from "./utils/storage";

export default function App() {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(() => !hasAnyApiKey());
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const {
    selectedCountry,
    sortBy,
    articlesSortDir,
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
    eventsFilters,
    handleCountryClick,
    handleGlobalSearch,
    handleOpenArticlesTab,
    handleApplyArticleFilters,
    handleArticlesSortDirToggle,
    handleEventsFilterChange,
    handleLoadMoreEvents,
    handleExtraSearch,
    handleClose,
    handleLoadMore,
    handleTopSourcesToggle,
    handleRunSavedSearch,
    getCurrentSearch,
  } = useAppControls();

  // a country selection opens the panel
  // Events tab loads immediately
  // Articles tab only fetches once it is opened
  const panelOpen =
    !!selectedCountry || loading || articles.length > 0 || !!error || !!meta;

  function handleSaveSearch() {
    const { topic, extraKeywords, queryOptions } = getCurrentSearch();
    if (!topic) return;
    addSavedSearch({
      label: selectedCountry,
      topic,
      extraKeywords,
      queryOptions,
    });
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-carbon-950">
      {/* Modals */}
      <SourcesModal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
      />
      <ApiKeysModal
        isOpen={showKeysModal}
        onClose={() => setShowKeysModal(false)}
      />
      <FavoritesPanel
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
      />
      <SavedSearchesPanel
        isOpen={showSavedSearches}
        onClose={() => setShowSavedSearches(false)}
        onRun={handleRunSavedSearch}
      />
      <DataBackupModal
        isOpen={showBackup}
        onClose={() => setShowBackup(false)}
      />
      <EventDetail
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
      <ArticleDetail
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      {/* Map layer — stays full-size; blurred/dimmed behind the panel
          instead of resized, now that the panel is a near-fullscreen
          overlay rather than a docked sidebar */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          panelOpen ? "blur-sm brightness-75" : ""
        }`}
      >
        <WorldMap
          selectedCountry={selectedCountry}
          onCountryClick={handleCountryClick}
          events={events}
          onEventClick={setSelectedEvent}
        />
      </div>

      {/* HUD: top search bar */}
      <TopBar
        onSearch={handleGlobalSearch}
        loading={loading}
        meta={meta}
        activeQuery={activeQuery}
        onSourcesClick={() => setShowSourcesModal(true)}
        onKeysClick={() => setShowKeysModal(true)}
        onFavoritesClick={() => setShowFavorites(true)}
        onSavedSearchesClick={() => setShowSavedSearches(true)}
        onBackupClick={() => setShowBackup(true)}
        isMobile={isMobile}
      />

      {/* Events/Articles panel — near-fullscreen overlay, not a docked sidebar */}
      {panelOpen && (
        <MonitorPanel
          articles={articles}
          loading={loading}
          error={error}
          meta={meta}
          selectedCountry={selectedCountry}
          onClose={handleClose}
          onApplyArticleFilters={handleApplyArticleFilters}
          articlesSortDir={articlesSortDir}
          onToggleArticlesSortDir={handleArticlesSortDirToggle}
          onExtraSearch={handleExtraSearch}
          onLoadMore={handleLoadMore}
          loadingMore={loadingMore}
          canLoadMore={canLoadMore}
          includePoliticalKeywords={includePoliticalKeywords}
          sortBy={sortBy}
          timeRange={timeRange}
          useTopSourcesOnly={useTopSourcesOnly}
          onTopSourcesToggle={handleTopSourcesToggle}
          onSaveSearch={handleSaveSearch}
          events={events}
          eventsLoading={eventsLoading}
          eventsLoadingMore={eventsLoadingMore}
          eventsError={eventsError}
          eventsHasMore={eventsHasMore}
          eventsFilters={eventsFilters}
          onEventsFilterChange={handleEventsFilterChange}
          onLoadMoreEvents={handleLoadMoreEvents}
          onSelectEvent={setSelectedEvent}
          onSelectArticle={setSelectedArticle}
          onOpenArticlesTab={handleOpenArticlesTab}
        />
      )}

      {/* Bottom HUD bar — hidden once the panel covers the screen */}
      {!panelOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-[998] flex items-center justify-between px-4 py-2 pointer-events-none">
          <span className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest hidden sm:inline">
            Click any country to monitor
          </span>
          <span className="text-[9px] font-mono text-carbon-700 uppercase tracking-widest">
            SENTINEL v1.0 · Global News Monitor
          </span>
        </div>
      )}
    </div>
  );
}
