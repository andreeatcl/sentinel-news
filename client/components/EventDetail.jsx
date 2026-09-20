import { toneCategory, TONE_TEXT_CLASS, TONE_LABELS } from "../utils/eventTone";

function formatDay(day = "") {
  if (day.length !== 8) return day;
  return `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;
}

function ActorRow({ label, actor }) {
  return (
    <div>
      <p className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-body text-white">
        {actor?.label || "Unspecified"}
      </p>
    </div>
  );
}

// "Reported in 20 mentions across 3 sources" reads as a plain fact;
// a bare 3-column number grid (the old design) didn't say what the
// numbers meant.
function coverageCaption(event) {
  const mentions = `${event.numMentions} mention${event.numMentions === 1 ? "" : "s"}`;
  const sources = `${event.numSources} source${event.numSources === 1 ? "" : "s"}`;
  return `Reported in ${mentions} across ${sources}`;
}

export default function EventDetail({ event, onClose }) {
  if (!event) return null;

  const tone = toneCategory(event.goldstein);
  const hasHeadline = !!event.headline;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-carbon-900 border border-carbon-700/80 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-carbon-700/70">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  tone === "positive"
                    ? "bg-signal-green"
                    : tone === "negative"
                      ? "bg-signal-red"
                      : "bg-signal-amber"
                }`}
              />
              <span className="text-[9px] font-mono text-carbon-500 uppercase tracking-widest truncate">
                {event.eventTypeLabel}
              </span>
            </div>
            {/* The actual headline, if the source article's page could be
                read — this is "what happened," the category above is just
                a tag */}
            <h2 className="font-body text-white text-base font-bold leading-snug">
              {hasHeadline ? event.headline : event.eventTypeLabel}
            </h2>
            <p className="text-[10px] font-mono text-carbon-500 mt-1.5">
              {formatDay(event.day)} · {event.location || "Unknown location"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center shrink-0"
          >
            ×
          </button>
        </div>

        {/* Preview — the source article's own description, when available */}
        {event.preview && (
          <div className="px-5 py-3 border-b border-carbon-700/50">
            <p className="text-[12px] font-body text-carbon-400 leading-relaxed line-clamp-4">
              {event.preview}
            </p>
          </div>
        )}

        {/* Who was involved */}
        <div className="grid grid-cols-2 gap-4 px-5 py-4 border-b border-carbon-700/50">
          <ActorRow label="Initiated by" actor={event.actor1} />
          <ActorRow label="Directed at" actor={event.actor2} />
        </div>

        {/* Tone, in plain language first, raw score second */}
        <div className="px-5 py-4 border-b border-carbon-700/50">
          <p className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest mb-1">
            Tone
          </p>
          <p className={`text-sm font-body font-bold ${TONE_TEXT_CLASS[tone]}`}>
            {TONE_LABELS[tone]}{" "}
            <span className="text-carbon-500 font-mono font-normal text-xs">
              (Goldstein {event.goldstein > 0 ? "+" : ""}
              {event.goldstein})
            </span>
          </p>
          <p className="text-[10px] font-mono text-carbon-500 mt-1.5">
            {coverageCaption(event)}
          </p>
        </div>

        {/* Source link — the "learn more" step */}
        {event.sourceUrl && (
          <div className="px-5 py-4">
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded bg-signal-cyan/15 border border-signal-cyan/50 text-signal-cyan hover:bg-signal-cyan/25 transition-colors"
            >
              Read source article
              <span>→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
