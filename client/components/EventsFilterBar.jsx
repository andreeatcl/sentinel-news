export default function EventsFilterBar({ timeRange, onTimeRangeChange }) {
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-carbon-700/50 shrink-0 flex-wrap">
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
    </div>
  );
}
