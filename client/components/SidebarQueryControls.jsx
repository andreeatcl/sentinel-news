export default function SidebarQueryControls({
  queryPreview,
  includePoliticalKeywords,
  onOpenKeywordBuilder,
  onPoliticalModeChange,
  onClearQuery,
}) {
  return (
    <div className="px-3 py-2 border-b border-carbon-700/50 shrink-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest">
          Query mode
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenKeywordBuilder}
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
              onClick={onClearQuery}
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
  );
}
