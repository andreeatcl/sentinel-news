import { SkeletonCard } from "./ArticleCard";
import { toneCategory } from "../utils/eventTone";

function formatDay(day = "") {
  if (day.length !== 8) return day;
  return `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;
}

function EventRow({ event, onClick }) {
  const tone = toneCategory(event.goldstein);
  const dotClass =
    tone === "positive"
      ? "bg-signal-green"
      : tone === "negative"
        ? "bg-signal-red"
        : "bg-signal-amber";

  // GDELT's structured data has no headline at all — this is fetched
  // server-side from the source article's own page title. When that fetch
  // failed (blocked site, timeout), fall back to the CAMEO category, which
  // is at least something rather than nothing.
  const headline = event.headline || event.eventTypeLabel;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 border-b border-carbon-700/50 hover:bg-carbon-700/40 transition-colors group"
    >
      {/* Headline: the actual "what happened" */}
      <div className="flex items-start gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotClass}`} />
        <p className="text-sm font-body font-bold text-white leading-snug group-hover:text-signal-cyan transition-colors">
          {headline}
        </p>
      </div>

      {/* Category + date */}
      <div className="flex items-center justify-between pl-4 mb-1">
        {event.headline && (
          <span className="text-[9px] font-mono text-carbon-500 uppercase tracking-wider truncate max-w-[70%]">
            {event.eventTypeLabel}
          </span>
        )}
        <span className="text-[9px] font-mono text-carbon-500 shrink-0 uppercase tracking-wider ml-auto">
          {formatDay(event.day)}
        </span>
      </div>

      {/* Who */}
      <p className="text-[11px] font-mono text-carbon-400 truncate pl-4">
        {event.actor1?.label || "Unspecified actor"}
        {event.actor2 ? ` → ${event.actor2.label}` : ""}
      </p>

      {/* Where */}
      {event.location && (
        <p className="text-[10px] font-mono text-carbon-600 mt-1 truncate pl-4">
          📍 {event.location}
        </p>
      )}
    </button>
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
