import { useEffect, useState } from "react";
import { getSavedSearches, removeSavedSearch } from "../utils/storage";

export default function SavedSearchesPanel({ isOpen, onClose, onRun }) {
  const [savedSearches, setSavedSearches] = useState([]);

  useEffect(() => {
    if (isOpen) setSavedSearches(getSavedSearches());
  }, [isOpen]);

  function handleRemove(id) {
    removeSavedSearch(id);
    setSavedSearches((current) => current.filter((item) => item.id !== id));
  }

  function handleRun(search) {
    onRun(search);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-carbon-900 border border-carbon-700/80 rounded-lg flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-700/70 shrink-0">
          <div>
            <h1 className="font-display text-white tracking-widest text-xl leading-none">
              SAVED SEARCHES
            </h1>
            <p className="text-[10px] font-mono text-carbon-500 mt-1 uppercase tracking-widest">
              Stored on this device
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {savedSearches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 px-6 text-center">
              <span className="text-carbon-600 font-mono text-xs uppercase tracking-widest">
                No saved searches yet
              </span>
              <p className="text-carbon-600 text-[10px] font-mono mt-2">
                Open a country's feed and use "Save search" to add one
              </p>
            </div>
          ) : (
            savedSearches.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-6 py-3 border-b border-carbon-700/50"
              >
                <button
                  onClick={() => handleRun(item)}
                  className="min-w-0 flex-1 text-left hover:text-signal-cyan transition-colors"
                >
                  <p className="text-sm font-body text-white leading-snug truncate">
                    {item.label}
                  </p>
                  {item.extraKeywords && (
                    <p className="text-[10px] font-mono text-carbon-500 truncate mt-0.5">
                      {item.extraKeywords}
                    </p>
                  )}
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-carbon-500 hover:text-signal-red transition-colors text-xs shrink-0"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
