export default function CustomTermInput({
  customInput,
  onCustomInputChange,
  onAddTerm,
  customTerms,
  onRemoveTerm,
}) {
  return (
    <div>
      <p className="text-[10px] font-mono text-carbon-500 mb-2 uppercase tracking-widest">
        Add custom keyword
      </p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => onCustomInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddTerm();
            }
          }}
          placeholder="one word only"
          className="flex-1 bg-carbon-800 border border-carbon-600/60 rounded text-[11px] font-mono text-white px-3 py-2 outline-none placeholder:text-carbon-600 focus:border-signal-cyan/50"
        />
        <button
          type="button"
          onClick={onAddTerm}
          className="text-[10px] font-mono font-bold text-signal-cyan border border-signal-cyan/40 rounded px-3 py-2 hover:bg-signal-cyan/10 transition-colors"
        >
          ADD
        </button>
      </div>
      <p className="text-[10px] font-mono text-carbon-600 mt-2">
        Press Enter or Add to append the word to this query only.
      </p>

      {customTerms.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {customTerms.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onRemoveTerm(term)}
              className="text-[10px] font-mono border border-signal-amber/40 text-signal-amber bg-signal-amber/10 rounded px-2 py-1 hover:bg-signal-amber/20 transition-colors"
            >
              {term} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
