import { useEffect, useMemo, useState } from "react";
import { getCountryKeywordOptions, timeAgo } from "../utils/newsApi";
import KeywordQueryModal from "./KeywordQueryModal";

function SkeletonCard() {
  return (
    <div className="p-4 border-b border-carbon-700/50 space-y-2">
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

function ArticleCard({ article, index }) {
  let domain = "";
  if (article.url) {
    try {
      domain = new URL(article.url).hostname.replace("www.", "");
    } catch {
      domain = "";
    }
  }
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 border-b border-carbon-700/50 hover:bg-carbon-700/40 transition-colors group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Source + time */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono font-bold text-signal-cyan uppercase tracking-wider truncate max-w-[60%]">
          {article.source?.name || domain}
        </span>
        <span className="text-[10px] font-mono text-carbon-500">
          {timeAgo(article.publishedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-body font-medium text-white leading-snug mb-1 group-hover:text-signal-cyan transition-colors line-clamp-3">
        {article.title?.replace(" - " + (article.source?.name || ""), "")}
      </h3>

      {/* Description */}
      {article.description && (
        <p className="text-[11px] font-body text-carbon-500 leading-relaxed line-clamp-2 mt-1">
          {article.description}
        </p>
      )}

      {/* Arrow indicator */}
      <div className="flex justify-end mt-2">
        <span className="text-[10px] font-mono text-carbon-600 group-hover:text-signal-cyan transition-colors">
          READ →
        </span>
      </div>
    </a>
  );
}

export default function NewsSidebar({
  articles,
  loading,
  loadingMore,
  canLoadMore,
  error,
  meta,
  selectedCountry,
  onClose,
  onSortChange,
  onTimeRangeChange,
  onExtraSearch,
  onLoadMore,
  includePoliticalKeywords,
  onPoliticalModeChange,
  sortBy,
  timeRange,
  useTopSourcesOnly,
  onTopSourcesToggle,
  isMobile = false,
}) {
  const [queryPreview, setQueryPreview] = useState("");
  const [showKeywordModal, setShowKeywordModal] = useState(false);

  const availableKeywords = useMemo(
    () => (selectedCountry ? getCountryKeywordOptions(selectedCountry) : []),
    [selectedCountry],
  );

  useEffect(() => {
    setQueryPreview("");
    setShowKeywordModal(false);
  }, [selectedCountry]);

  function handleApplyKeywordQuery({ expression, queryOptions }) {
    const nextExpression = expression || "";
    setQueryPreview(nextExpression);
    if (selectedCountry) {
      onExtraSearch({
        topic: selectedCountry,
        extraKeywords: nextExpression,
        queryOptions,
      });
    }
  }

  function clearKeywordQuery() {
    setExtraKeywords("");
    setQueryPreview("");
    if (selectedCountry) {
      onExtraSearch({
        topic: selectedCountry,
        extraKeywords: "",
        queryOptions: {},
      });
    }
  }

  return (
    <div
      className={`sidebar-enter absolute z-[999] flex flex-col bg-carbon-900/98 backdrop-blur-md ${
        isMobile
          ? "left-0 right-0 bottom-0 top-[54%] border-t border-carbon-700/70 rounded-t-xl"
          : "top-0 right-0 bottom-0 w-[380px] max-w-[90vw] border-l border-carbon-700/70"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-carbon-700/70 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-amber pulse-dot" />
            )}
            {!loading && articles.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green" />
            )}
            <span className="font-display text-white tracking-widest text-base">
              {selectedCountry || "MONITOR"}
            </span>
          </div>
          {meta && (
            <p className="text-[10px] font-mono text-carbon-500 mt-0.5">
              {meta.totalResults?.toLocaleString()} results
              {meta.cached ? ` · cached ${meta.cacheAge}s ago` : ""}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-carbon-500 hover:text-white transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-carbon-700/50 shrink-0 flex-wrap">
        {/* Sort */}
        <div className="flex gap-1">
          {["relevancy", "publishedAt", "popularity"].map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
                sortBy === s
                  ? "bg-signal-cyan/20 border-signal-cyan/60 text-signal-cyan"
                  : "border-carbon-600/60 text-carbon-500 hover:border-carbon-500"
              }`}
            >
              {s === "publishedAt" ? "Newest" : s}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-carbon-700/60 mx-1" />

        {/* Time range */}
        {["48h", "7d", "30d"].map((t) => (
          <button
            key={t}
            onClick={() => onTimeRangeChange(t)}
            className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors ${
              timeRange === t
                ? "bg-signal-amber/20 border-signal-amber/60 text-signal-amber"
                : "border-carbon-600/60 text-carbon-500 hover:border-carbon-500"
            }`}
          >
            {t}
          </button>
        ))}

        <div className="h-4 w-px bg-carbon-700/60 mx-1" />

        {/* Top Sources toggle */}
        <button
          onClick={onTopSourcesToggle}
          className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded border transition-colors whitespace-nowrap ${
            useTopSourcesOnly
              ? "bg-signal-green/20 border-signal-green/60 text-signal-green"
              : "border-carbon-600/60 text-carbon-500 hover:border-carbon-500"
          }`}
        >
          Top Sources {useTopSourcesOnly ? "✓" : ""}
        </button>
      </div>

      {/* Keyword filter (only when country selected) */}
      {selectedCountry && (
        <div className="px-3 py-2 border-b border-carbon-700/50 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest">
              Query mode
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeywordModal(true)}
                className="text-[10px] font-mono font-bold text-signal-cyan border border-signal-cyan/40 rounded px-2 py-1 hover:bg-signal-cyan/10 transition-colors whitespace-nowrap"
              >
                KEYWORD BUILDER
              </button>

              <button
                type="button"
                onClick={() => onPoliticalModeChange(!includePoliticalKeywords)}
                className={`text-[10px] font-mono font-bold rounded border px-2 py-1 transition-colors whitespace-nowrap ${
                  includePoliticalKeywords
                    ? "text-signal-cyan border-signal-cyan/40 bg-signal-cyan/10"
                    : "text-carbon-400 border-carbon-600/60 hover:border-carbon-500"
                }`}
              >
                {includePoliticalKeywords ? "POLITICAL ON" : "POLITICAL OFF"}
              </button>

              {!!queryPreview && (
                <button
                  type="button"
                  onClick={clearKeywordQuery}
                  className="text-[10px] font-mono font-bold text-carbon-400 border border-carbon-600/70 rounded px-2 py-1 hover:border-carbon-500 transition-colors whitespace-nowrap"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {!!queryPreview && (
            <p className="mt-2 text-[10px] font-mono text-carbon-500 break-words max-h-12 overflow-y-auto">
              Active: {queryPreview}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
            <span className="text-signal-red font-mono text-sm mb-2">
              ⚠ SIGNAL LOST
            </span>
            <p className="text-carbon-500 text-xs font-mono">{error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
            <span className="text-carbon-600 font-mono text-xs uppercase tracking-widest">
              No articles found
            </span>
            <p className="text-carbon-600 text-[10px] font-mono mt-2">
              Try adjusting the time range or keywords
            </p>
          </div>
        )}

        {!loading &&
          articles.map((article, i) => (
            <ArticleCard key={article.url || i} article={article} index={i} />
          ))}
      </div>

      {/* Footer */}
      {articles.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-carbon-700/50 space-y-2">
          <p className="text-[9px] font-mono text-carbon-600 text-center uppercase tracking-widest">
            {articles.length} loaded · powered by NewsAPI
          </p>
          <button
            disabled
            className="w-full text-[10px] font-mono font-bold text-carbon-500 border border-carbon-700/70 rounded px-3 py-1.5 opacity-50 cursor-not-allowed"
          >
            SEE MORE (DISABLED)
          </button>
        </div>
      )}

      <KeywordQueryModal
        isOpen={showKeywordModal && !!selectedCountry}
        countryName={selectedCountry}
        availableKeywords={availableKeywords}
        onApply={handleApplyKeywordQuery}
        onClose={() => setShowKeywordModal(false)}
      />
    </div>
  );
}
