import { useEffect, useMemo, useState } from "react";
import { getCountryKeywordOptions } from "../utils/queryBuilder";
import KeywordQueryModal from "./KeywordQueryModal";
import ArticleCard, { SkeletonCard } from "./ArticleCard";
import { AccordionSection, Pill } from "./FilterAccordion";
import SortControl from "./SortControl";
import SearchBar from "./SearchBar";

const TIME_RANGES = ["48h", "7d", "30d"];

const ARTICLE_SORT_OPTIONS = [
  { value: "relevancy", label: "Relevance" },
  { value: "publishedAt", label: "Date" },
  { value: "popularity", label: "Popularity" },
];

export default function ArticlesTab({
  articles,
  loading,
  loadingMore,
  canLoadMore,
  error,
  selectedCountry,
  sortBy,
  timeRange,
  includePoliticalKeywords,
  articlesSortDir,
  onToggleArticlesSortDir,
  onApplyArticleFilters,
  useTopSourcesOnly,
  onTopSourcesToggle,
  onExtraSearch,
  onLoadMore,
  onSelectArticle,
}) {
  const [queryPreview, setQueryPreview] = useState("");
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    sortBy,
    timeRange,
    includePoliticalKeywords,
  });

  const availableKeywords = useMemo(
    () => (selectedCountry ? getCountryKeywordOptions(selectedCountry) : []),
    [selectedCountry],
  );

  // reset keyword query + draft when switching countries
  useEffect(() => {
    setQueryPreview("");
    setShowKeywordModal(false);
    setDraftFilters({ sortBy, timeRange, includePoliticalKeywords });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const isDirty =
    draftFilters.sortBy !== sortBy ||
    draftFilters.timeRange !== timeRange ||
    draftFilters.includePoliticalKeywords !== includePoliticalKeywords;

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
    <>
      <SortControl
        value={draftFilters.sortBy}
        direction={articlesSortDir}
        options={ARTICLE_SORT_OPTIONS}
        onChange={(value) => setDraftFilters((f) => ({ ...f, sortBy: value }))}
        onToggleDirection={onToggleArticlesSortDir}
      />

      <div className="shrink-0">
        <AccordionSection title="Time Range" defaultOpen>
          {TIME_RANGES.map((t) => (
            <Pill
              key={t}
              active={draftFilters.timeRange === t}
              onClick={() => setDraftFilters((f) => ({ ...f, timeRange: t }))}
            >
              {t}
            </Pill>
          ))}
        </AccordionSection>

        {/* client-side only, no request — stays live */}
        <AccordionSection
          title="Sources"
          activeCount={useTopSourcesOnly ? 1 : 0}
        >
          <Pill active={useTopSourcesOnly} onClick={onTopSourcesToggle}>
            Top sources only
          </Pill>
        </AccordionSection>

        {selectedCountry && (
          <AccordionSection title="Keywords" activeCount={queryPreview ? 1 : 0}>
            <div className="w-full space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill
                  active={draftFilters.includePoliticalKeywords}
                  onClick={() =>
                    setDraftFilters((f) => ({
                      ...f,
                      includePoliticalKeywords: !f.includePoliticalKeywords,
                    }))
                  }
                >
                  Political
                </Pill>
                <button
                  type="button"
                  onClick={() => setShowKeywordModal(true)}
                  className="text-[10px] font-mono font-bold text-signal-cyan border border-signal-cyan/40 rounded-full px-2.5 py-1 hover:bg-signal-cyan/10 transition-colors whitespace-nowrap"
                >
                  Keyword builder
                </button>
                {!!queryPreview && (
                  <Pill active onClick={clearKeywordQuery}>
                    Clear
                  </Pill>
                )}
              </div>
              {!!queryPreview && (
                <p className="text-[10px] font-mono text-carbon-500 break-words max-h-12 overflow-y-auto">
                  Active: {queryPreview}
                </p>
              )}
            </div>
          </AccordionSection>
        )}
      </div>

      {isDirty && (
        <SearchBar onSearch={() => onApplyArticleFilters(draftFilters)} />
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
            <ArticleCard
              key={article.url || i}
              article={article}
              index={i}
              onClick={() => onSelectArticle(article)}
            />
          ))}
      </div>

      {/* Footer */}
      {articles.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-carbon-700/50 space-y-2">
          <p className="text-[9px] font-mono text-carbon-600 text-center uppercase tracking-widest">
            {articles.length} loaded · powered by NewsAPI
          </p>
          {canLoadMore && (
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="w-full text-[10px] font-mono font-bold text-carbon-300 border border-carbon-600/70 rounded px-3 py-1.5 hover:border-signal-cyan/60 hover:text-signal-cyan transition-colors disabled:opacity-40"
            >
              {loadingMore ? "LOADING…" : "SEE MORE"}
            </button>
          )}
        </div>
      )}

      <KeywordQueryModal
        isOpen={showKeywordModal && !!selectedCountry}
        countryName={selectedCountry}
        availableKeywords={availableKeywords}
        onApply={handleApplyKeywordQuery}
        onClose={() => setShowKeywordModal(false)}
      />
    </>
  );
}
