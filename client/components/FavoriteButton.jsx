import { useState } from "react";
import { isFavorite, addFavorite, removeFavorite } from "../utils/storage";

// reads/writes to localStorage directly instead of carrying fav state through props
export default function FavoriteButton({ article }) {
  const [favorited, setFavorited] = useState(() => isFavorite(article.url));

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(article.url);
    } else {
      addFavorite(article);
    }
    setFavorited(!favorited);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={favorited ? "Remove from favorites" : "Save to favorites"}
      className={`text-sm leading-none transition-colors ${
        favorited
          ? "text-signal-amber"
          : "text-carbon-600 hover:text-signal-amber"
      }`}
    >
      {favorited ? "★" : "☆"}
    </button>
  );
}
