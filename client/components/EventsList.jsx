import {
  SkeletonCard,
  ROW_CLASS,
  ROW_BUTTON_CLASS,
  ROW_TITLE_CLASS,
  ROW_META_CLASS,
} from "./ArticleCard";
import FavoriteButton from "./FavoriteButton";
import TrustBadge from "./TrustBadge";
import EmptyState from "./ui/EmptyState";
import { toneCategory, TONE_LABELS, TONE_DOT_CLASS } from "../utils/eventTone";
import {
  validActorLabel,
  fallbackHeadline,
  eventTimeLabel,
  getDomain,
} from "../utils/eventDisplay";

function EventRow({ event, onClick }) {
  const tone = toneCategory(event.goldstein);
  const dotClass = TONE_DOT_CLASS[tone];

  const headline = event.headline || fallbackHeadline(event);
  const domain = getDomain(event.sourceUrl);

  const actor1Label = validActorLabel(event.actor1);
  const actor2Label = validActorLabel(event.actor2);
  const actorsLine =
    actor1Label && actor2Label
      ? `${actor1Label} → ${actor2Label}`
      : actor1Label || actor2Label || null;

  const favoriteTarget = event.sourceUrl
    ? {
        url: event.sourceUrl,
        title: headline,
        source: { name: domain },
        type: "event",
      }
    : null;

  return (
    <div className={ROW_CLASS}>
      <button onClick={onClick} className={ROW_BUTTON_CLASS}>
        {/* Source + time */}
        <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`}
            title={TONE_LABELS[tone]}
          />
          {domain && (
            <span className="text-xs font-medium text-carbon-300 truncate">
              {domain}
            </span>
          )}
          {event.numSources > 1 && (
            <span className={`${ROW_META_CLASS} shrink-0`}>
              · {event.numSources} sources
            </span>
          )}
          <TrustBadge trust={event._trustLabel} />
          <span className={`${ROW_META_CLASS} shrink-0 ml-auto pl-2`}>
            {eventTimeLabel(event)}
          </span>
        </div>

        <p className={ROW_TITLE_CLASS}>{headline}</p>

        {(actorsLine || event.location) && (
          <p className="text-xs text-carbon-400 mt-1 truncate">
            {actorsLine}
            {actorsLine && event.location && (
              <span className="text-carbon-600"> · </span>
            )}
            {event.location && (
              <span className="text-carbon-500">{event.location}</span>
            )}
          </p>
        )}
      </button>

      {favoriteTarget && (
        <div className="absolute top-2.5 right-3">
          <FavoriteButton article={favoriteTarget} />
        </div>
      )}
    </div>
  );
}

export default function EventsList({ events, loading, error, onSelectEvent }) {
  if (loading) {
    return (
      <div>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState error title="Couldn't load events" description={error} />
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title="No significant events found"
        description="Try a wider time range, or check back later — GDELT coverage builds up over time."
      />
    );
  }

  return (
    <div>
      {events.map((event) => (
        <EventRow
          key={event.id}
          event={event}
          onClick={() => onSelectEvent(event)}
        />
      ))}
    </div>
  );
}
