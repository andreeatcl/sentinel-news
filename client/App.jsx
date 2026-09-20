import { useState } from "react";
import WorldMap from "./components/WorldMap";
import TopBar from "./components/TopBar";
import NewsSidebar from "./components/NewsSidebar";
import SourcesModal from "./components/SourcesModal";
import ApiKeysModal from "./components/ApiKeysModal";
import FavoritesPanel from "./components/FavoritesPanel";
import SavedSearchesPanel from "./components/SavedSearchesPanel";
import DataBackupModal from "./components/DataBackupModal";
import EventDetail from "./components/EventDetail";
import { useAppControls } from "./hooks/useAppControls";
import { hasAnyApiKey, addSavedSearch } from "./utils/storage";

export default function App() {
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [showKeysModal, setShowKeysModal] = useState(() => !hasAnyApiKey());
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const {
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
    handleLoadMoreEvents,
    handleExtraSearch,
    handlePoliticalModeChange,
    handleClose,
    handleLoadMore,
    handleTopSourcesToggle,
    handleRunSavedSearch,
    getCurrentSearch,
  } = useAppControls();

  // a country selection opens the sidebar
  // Events tab loads immediately
  // Articles tab only fetches once it is opened
  const sidebarOpen =
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
          onSaveSearch={handleSaveSearch}
          events={events}
          eventsLoading={eventsLoading}
          eventsLoadingMore={eventsLoadingMore}
          eventsError={eventsError}
          eventsHasMore={eventsHasMore}
          eventsTimeRange={eventsTimeRange}
          onEventsTimeRangeChange={handleEventsTimeRangeChange}
          onLoadMoreEvents={handleLoadMoreEvents}
          onSelectEvent={setSelectedEvent}
          onOpenArticlesTab={handleOpenArticlesTab}
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
