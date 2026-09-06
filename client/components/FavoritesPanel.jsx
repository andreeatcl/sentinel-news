import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../utils/storage";

export default function FavoritesPanel({ isOpen, onClose }) {
  const [favorites, setFavorites] = useState([]);

  // re-read from storage every time the panel opens
  useEffect(() => {
    if (isOpen) setFavorites(getFavorites());
  }, [isOpen]);

  function handleRemove(url) {
    removeFavorite(url);
    setFavorites((current) => current.filter((item) => item.url !== url));
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
              FAVORITES
            </h1>
            <p className="text-[10px] font-mono text-carbon-500 mt-1 uppercase tracking-widest">
              Saved on this device
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
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 px-6 text-center">
              <span className="text-carbon-600 font-mono text-xs uppercase tracking-widest">
                No favorites yet
              </span>
              <p className="text-carbon-600 text-[10px] font-mono mt-2">
                Tap the star on an article to save it here
              </p>
            </div>
          ) : (
            favorites.map((item) => (
              <div
                key={item.url}
                className="flex items-start justify-between gap-3 px-6 py-3 border-b border-carbon-700/50"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 hover:text-signal-cyan transition-colors"
                >
                  <p className="text-[10px] font-mono text-carbon-500 uppercase tracking-wider truncate">
                    {item.sourceName}
                  </p>
                  <p className="text-sm font-body text-white leading-snug line-clamp-2">
                    {item.title}
                  </p>
                </a>
                <button
                  onClick={() => handleRemove(item.url)}
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
