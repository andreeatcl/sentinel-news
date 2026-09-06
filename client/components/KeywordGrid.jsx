export default function KeywordGrid({
  keywords,
  selectedKeywords,
  onToggleKeyword,
  onSelectAll,
  onDeselectAll,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <p className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest">
          Country keyword options
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[10px] font-mono font-bold text-carbon-300 border border-carbon-600/70 rounded px-2 py-1 hover:border-carbon-500 transition-colors"
          >
            SELECT ALL
          </button>
          <button
            type="button"
            onClick={onDeselectAll}
            className="text-[10px] font-mono font-bold text-carbon-400 border border-carbon-600/70 rounded px-2 py-1 hover:border-carbon-500 transition-colors"
          >
            DESELECT ALL
          </button>
        </div>
      </div>

      {keywords.length === 0 ? (
        <div className="text-[11px] font-mono text-carbon-600 border border-carbon-700/60 rounded px-3 py-2">
          No predefined keywords available for this country.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {keywords.map((keyword) => {
            const active = selectedKeywords.includes(keyword);
            return (
              <label
                key={keyword}
                className={`flex items-center gap-2 px-2.5 py-2 border rounded cursor-pointer transition-colors ${
                  active
                    ? "border-signal-cyan/60 bg-signal-cyan/10"
                    : "border-carbon-700/70 bg-carbon-800/40 hover:border-carbon-600"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggleKeyword(keyword)}
                  className="accent-signal-cyan"
                />
                <span
                  className={`text-[11px] font-mono leading-tight ${
                    active ? "text-signal-cyan" : "text-carbon-300"
                  }`}
                >
                  {keyword}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
