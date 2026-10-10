import ArticleDetail from "../articles/ArticleDetail";
import EventDetail from "../events/EventDetail";
import { FavoriteContext } from "./FavoriteButton";

export default function FavoriteDetail({ item, onClose }) {
  return (
    <FavoriteContext.Provider value={item.context ?? null}>
      {item.type === "event" ? (
        <EventDetail event={item.snapshot} onClose={onClose} />
      ) : (
        <ArticleDetail article={item.snapshot} onClose={onClose} />
      )}
    </FavoriteContext.Provider>
  );
}
