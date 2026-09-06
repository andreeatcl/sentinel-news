export default function SidebarFilterBar({
  sortBy,
  onSortChange,
  timeRange,
  onTimeRangeChange,
  useTopSourcesOnly,
  onTopSourcesToggle,
}) {
  return (
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
  );
}
