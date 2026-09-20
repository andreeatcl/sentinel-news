import { useState } from "react";
import { timeAgo } from "../utils/newsApi";
import { getDomain } from "../utils/url";
import FavoriteButton from "./FavoriteButton";

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-body text-white">{value}</p>
    </div>
  );
}

export default function ArticleDetail({ article, onClose }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!article) return null;

  const isGdelt = article._provider === "gdelt";
  const domain = getDomain(article.url);
  const title = article.title?.replace(
    " - " + (article.source?.name || ""),
    "",
  );
  const sourceName = article.source?.name || domain;
  const hasNonEnglish =
    article.language && !/^english$/i.test(article.language);

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
                isGdelt ? "bg-signal-amber" : "bg-signal-cyan"
              }`}
            />
            <h2 className="font-body text-white text-base font-bold leading-snug">
              {title}
            </h2>
            <p className="text-[10px] font-mono text-carbon-500 mt-1.5">
              {timeAgo(article.publishedAt)} · {sourceName}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
              <FavoriteButton article={article} />
            </div>
            <button
              onClick={onClose}
              className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Image, when the article has one */}
        {article.urlToImage && !imageFailed && (
          <img
            src={article.urlToImage}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full max-h-48 object-cover border-b border-carbon-700/50"
          />
        )}

        {/* Preview — the article's own description */}
        {article.description && (
          <div className="px-5 py-3 border-b border-carbon-700/50">
            <p className="text-[12px] font-body text-carbon-400 leading-relaxed">
              {article.description}
            </p>
          </div>
        )}

        {/* Source / author */}
        <div className="grid grid-cols-2 gap-4 px-5 py-4 border-b border-carbon-700/50">
          <InfoRow label="Source" value={sourceName} />
          <InfoRow
            label="Published"
            value={timeAgo(article.publishedAt) || "Unknown"}
          />
        </div>

        {/* Provenance — same visual slot as EventDetail's Tone section */}
        <div className="px-5 py-4 border-b border-carbon-700/50">
          <p className="text-[9px] font-mono text-carbon-600 uppercase tracking-widest mb-1">
            Provenance
          </p>
          <p className="text-sm font-body font-bold text-white">
            {isGdelt ? "GDELT" : "NewsAPI"}
            {hasNonEnglish && (
              <span className="text-carbon-500 font-mono font-normal text-xs">
                {" "}
                · {article.language}
              </span>
            )}
          </p>
          <p className="text-[10px] font-mono text-carbon-500 mt-1.5">
            {isGdelt
              ? "Broad global coverage, weaker metadata"
              : "Curated English-language source"}
          </p>
        </div>

        {/* Source link — the "learn more" step */}
        {article.url && (
          <div className="px-5 py-4 text-center">
            <a
              href={article.url}
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
