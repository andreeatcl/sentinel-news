import { SkeletonCard } from "./ArticleCard";
import FavoriteButton from "./FavoriteButton";
import { toneCategory } from "../utils/eventTone";
import {
  validActorLabel,
  fallbackHeadline,
  eventTimeLabel,
  getDomain,
} from "../utils/eventDisplay";

function EventRow({ event, onClick }) {
  const tone = toneCategory(event.goldstein);
  const dotClass =
    tone === "positive"
      ? "bg-signal-green"
      : tone === "negative"
        ? "bg-signal-red"
        : "bg-signal-amber";

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
    <div className="relative border-b border-carbon-700/50 group">
      <button
        onClick={onClick}
        className="w-full text-left p-4 pr-9 hover:bg-carbon-700/40 transition-colors"
      >
        {/* Headline: the actual "what happened" */}
        <div className="flex items-start gap-2 mb-1">
          <span
            className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotClass}`}
          />
          <p className="text-sm font-body font-bold text-white leading-snug group-hover:text-signal-cyan transition-colors">
            {headline}
          </p>
        </div>

        {/* Source + time */}
        <div className="flex items-center justify-between pl-4 mb-1">
          {domain && (
            <span className="text-[9px] font-mono text-carbon-500 truncate max-w-[60%]">
              {domain}
              {event.numSources > 1 && ` · ${event.numSources} sources`}
            </span>
          )}
          <span className="text-[9px] font-mono text-carbon-500 shrink-0 uppercase tracking-wider ml-auto">
            {eventTimeLabel(event)}
          </span>
        </div>

        {/* Who */}
        {actorsLine && (
          <p className="text-[11px] font-mono text-carbon-400 truncate pl-4">
            {actorsLine}
          </p>
        )}

        {/* Where */}
        {event.location && (
          <p className="text-[10px] font-mono text-carbon-600 mt-1 truncate pl-4">
            📍 {event.location}
          </p>
        )}
      </button>

      {/* A nested <button> inside the row's <button> would be invalid —
          this sits as a sibling, absolutely positioned on top instead */}
      {favoriteTarget && (
        <div className="absolute top-3 right-3">
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
      <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
        <span className="text-signal-red font-mono text-sm mb-2">
          ⚠ SIGNAL LOST
        </span>
        <p className="text-carbon-500 text-xs font-mono">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
        <span className="text-carbon-600 font-mono text-xs uppercase tracking-widest">
          No significant events found
        </span>
        <p className="text-carbon-600 text-[10px] font-mono mt-2">
          Try a wider time range, or check back later — GDELT coverage builds up
          over time
        </p>
      </div>
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
