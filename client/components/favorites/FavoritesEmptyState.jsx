import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import { PlusIcon } from "../ui/icons";

export default function FavoritesEmptyState({
  kind,
  onAddFavorites,
  onClearFilters,
}) {
  if (kind === "none") {
    return (
      <EmptyState
        title="No favorites yet"
        description="Tap the star on an article or event to save it here."
      />
    );
  }

  if (kind === "emptyGroup") {
    return (
      <div className="pb-6 text-center">
        <EmptyState
          title="Nothing in this group yet"
          description="Add favorites here, or use the folder button on any favorite."
        />
        <Button size="sm" onClick={onAddFavorites}>
          <PlusIcon className="w-3.5 h-3.5" />
          Add favorites
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-6 text-center">
      <EmptyState
        title="No matching favorites"
        description="Nothing saved matches these filters."
      />
      <Button size="sm" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  );
}
