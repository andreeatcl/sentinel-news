import { createContext, useContext, useState } from "react";
import { isFavorite, addFavorite, removeFavorite } from "../../utils/storage";
import { StarIcon } from "../ui/icons";

export const FavoriteContext = createContext(null);

export default function FavoriteButton({ favorite }) {
  const context = useContext(FavoriteContext);
  const [favorited, setFavorited] = useState(() => isFavorite(favorite.url));

  function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (favorited) {
      removeFavorite(favorite.url);
    } else {
      addFavorite({ ...favorite, context });
    }
    setFavorited(!favorited);
  }

  const label = favorited ? "Remove from favorites" : "Save to favorites";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      aria-pressed={favorited}
      className={`w-7 h-7 inline-flex items-center justify-center rounded-md transition-colors hover:bg-carbon-800 ${
        favorited
          ? "text-signal-amber"
          : "text-carbon-500 hover:text-carbon-100"
      }`}
    >
      <StarIcon filled={favorited} className="w-4 h-4" />
    </button>
  );
}
