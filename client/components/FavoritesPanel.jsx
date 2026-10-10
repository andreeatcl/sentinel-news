import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../utils/storage";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import EmptyState from "./ui/EmptyState";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Favorites"
      subtitle="Saved on this device"
    >
      {favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Tap the star on an article or event to save it here."
        />
      ) : (
        favorites.map((item) => (
          <div
            key={item.url}
            className="flex items-center justify-between gap-3 px-5 py-3 border-b border-carbon-800 last:border-b-0 hover:bg-carbon-850 transition-colors group"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1"
            >
              <p className="flex items-center gap-1.5 text-xs text-carbon-500 mb-0.5">
                <span className="truncate">{item.sourceName}</span>
                {item.type === "event" && <Badge>Event</Badge>}
              </p>
              <p className="text-sm text-carbon-100 group-hover:text-white leading-snug line-clamp-2 transition-colors">
                {item.title}
              </p>
            </a>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleRemove(item.url)}
            >
              Remove
            </Button>
          </div>
        ))
      )}
    </Modal>
  );
}
