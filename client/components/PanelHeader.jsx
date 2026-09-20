import { useState } from "react";

export default function PanelHeader({
  selectedCountry,
  loading,
  hasArticles,
  meta,
  activeTab,
  onTabClick,
  onSaveSearch,
  onClose,
}) {
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSaveSearchClick() {
    onSaveSearch();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  return (
    <div className="flex items-end justify-between gap-3 px-4 pt-3 bg-carbon-950/60 border-b border-carbon-700/70 shrink-0">
      <div className="flex items-end gap-3 min-w-0">
        <div className="pb-2.5 min-w-0">
          <div className="flex items-center gap-2">
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-amber pulse-dot" />
            )}
            {!loading && hasArticles && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green" />
            )}
            <span className="font-display text-white tracking-widest text-base truncate">
              {selectedCountry || "MONITOR"}
            </span>
          </div>
          {meta && (
            <p className="text-[10px] font-mono text-carbon-500 mt-0.5 truncate">
              {meta.totalResults?.toLocaleString()} results
              {meta.cached ? ` · cached ${meta.cacheAge}s ago` : ""}
            </p>
          )}
        </div>

        {selectedCountry && (
          <div className="flex items-end gap-1 shrink-0">
            {[
              { id: "events", label: "Events" },
              { id: "articles", label: "Articles" },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabClick(tab.id)}
                  className={`text-[11px] font-mono font-bold uppercase tracking-widest px-4 py-2 rounded-t-lg border transition-colors ${
                    active
                      ? "bg-carbon-900 text-signal-cyan border-carbon-700/70 border-b-carbon-900 -mb-px relative z-10"
                      : "bg-carbon-800/50 text-carbon-500 border-transparent hover:text-carbon-300 hover:bg-carbon-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 pb-2.5">
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
  );
}
