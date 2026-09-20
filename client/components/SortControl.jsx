export default function SortControl({
  value,
  direction,
  options,
  onChange,
  onToggleDirection,
}) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-carbon-700/50 shrink-0">
      <span className="text-[9px] font-mono text-carbon-500 uppercase tracking-widest">
        Sort
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-carbon-800 border border-carbon-600/60 text-carbon-200 text-[10px] font-mono uppercase tracking-wider rounded px-2 py-1.5 outline-none focus:border-signal-cyan/60 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onToggleDirection}
        title={direction === "asc" ? "Ascending" : "Descending"}
        className="text-xs font-mono text-carbon-400 hover:text-signal-cyan border border-carbon-600/60 hover:border-signal-cyan/60 rounded px-2.5 py-1.5 transition-colors shrink-0"
      >
        {direction === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}
