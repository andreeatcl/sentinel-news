import { useState } from "react";
import { toneCategory, TONE_TEXT_CLASS, TONE_LABELS } from "../utils/eventTone";
import {
  validActorLabel,
  fallbackHeadline,
  eventTimeLabel,
  getDomain,
} from "../utils/eventDisplay";
import FavoriteButton from "./FavoriteButton";

function ActorRow({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-body text-white">{value}</p>
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
  const [imageFailed, setImageFailed] = useState(false);
  if (!event) return null;

  const tone = toneCategory(event.goldstein);
  const headline = event.headline || fallbackHeadline(event);
  const domain = getDomain(event.sourceUrl);
  const actor1Label = validActorLabel(event.actor1);
  const actor2Label = validActorLabel(event.actor2);
  const favoriteTarget = event.sourceUrl
    ? {
        url: event.sourceUrl,
        title: headline,
        source: { name: domain },
        type: "event",
      }
    : null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-carbon-900 border border-carbon-700/80 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-carbon-700/70">
          <div className="min-w-0">
            <span
              className={`inline-block w-2 h-2 rounded-full mb-1.5 ${
                tone === "positive"
                  ? "bg-signal-green"
                  : tone === "negative"
                    ? "bg-signal-red"
                    : "bg-signal-amber"
              }`}
            />
            <h2 className="font-body text-white text-base font-bold leading-snug">
              {headline}
            </h2>
            <p className="text-[10px] font-mono text-carbon-500 mt-1.5">
              {eventTimeLabel(event)} · {event.location || "Unknown location"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {favoriteTarget && (
              <div className="w-8 h-8 flex items-center justify-center">
                <FavoriteButton article={favoriteTarget} />
              </div>
            )}
            <button
              onClick={onClose}
              className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Image from the source article's page, when it has one */}
        {event.image && !imageFailed && (
          <img
            src={event.image}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full max-h-48 object-cover border-b border-carbon-700/50"
          />
        )}

        {/* Preview — the source article's own description, when available */}
        {event.preview && (
          <div className="px-5 py-3 border-b border-carbon-700/50">
            <p className="text-[12px] font-body text-carbon-400 leading-relaxed">
              {event.preview}
            </p>
          </div>
        )}

        {/* Who was involved — actors GDELT couldn't code or we couldn't
            decode are omitted rather than shown as "Unspecified" */}
        {(actor1Label || actor2Label) && (
          <div
            className={`grid gap-4 px-5 py-4 border-b border-carbon-700/50 ${
              actor1Label && actor2Label ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            {actor1Label && (
              <ActorRow label="Initiated by" value={actor1Label} />
            )}
            {actor2Label && (
              <ActorRow label="Directed at" value={actor2Label} />
            )}
          </div>
        )}

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
          <div className="px-5 py-4 text-center">
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 rounded bg-signal-cyan/15 border border-signal-cyan/50 text-signal-cyan hover:bg-signal-cyan/25 transition-colors"
            >
              Read source article
              <span>→</span>
            </a>
            {domain && (
              <p className="text-[10px] font-mono text-carbon-500 mt-2">
                {domain}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
