import { useEffect, useState } from "react";
import { getSavedSearches, removeSavedSearch } from "../utils/storage";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved searches"
      subtitle="Stored on this device"
    >
      {savedSearches.length === 0 ? (
        <EmptyState
          title="No saved searches yet"
          description="Open a country's feed and use Save search to add one."
        />
      ) : (
        savedSearches.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 px-5 py-3 border-b border-carbon-800 last:border-b-0 hover:bg-carbon-850 transition-colors group"
          >
            <button
              onClick={() => handleRun(item)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-sm font-medium text-carbon-100 group-hover:text-white leading-snug truncate transition-colors">
                {item.label}
              </p>
              {item.extraKeywords && (
                <p className="text-xs font-mono text-carbon-500 truncate mt-0.5">
                  {item.extraKeywords}
                </p>
              )}
            </button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleRemove(item.id)}
            >
              Remove
            </Button>
          </div>
        ))
      )}
    </Modal>
  );
}
