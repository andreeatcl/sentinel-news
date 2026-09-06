function OperatorSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-carbon-800 border border-carbon-600/60 rounded text-[10px] font-mono text-white px-2 py-1 outline-none focus:border-signal-cyan/50"
    >
      <option value="OR">OR</option>
      <option value="AND">AND</option>
    </select>
  );
}

export default function KeywordOperatorControls({
  includeCountryInQuery,
  onToggleIncludeCountry,
  selectedOperator,
  onSelectedOperatorChange,
  customOperator,
  onCustomOperatorChange,
  combineOperator,
  onCombineOperatorChange,
}) {
  return (
    <div className="px-5 py-3 border-b border-carbon-700/50 shrink-0 flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={onToggleIncludeCountry}
        className={`text-[10px] font-mono font-bold rounded border px-2 py-1 transition-colors ${
          includeCountryInQuery
            ? "text-signal-green border-signal-green/50 bg-signal-green/10"
            : "text-carbon-400 border-carbon-600/70 hover:border-carbon-500"
        }`}
      >
        COUNTRY {includeCountryInQuery ? "ON" : "OFF"}
      </button>

      <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-wider">
        Selected keywords:
      </span>
      <OperatorSelect
        value={selectedOperator}
        onChange={onSelectedOperatorChange}
      />

      <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-wider">
        custom terms:
      </span>
      <OperatorSelect
        value={customOperator}
        onChange={onCustomOperatorChange}
      />

      <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-wider">
        between groups:
      </span>
      <OperatorSelect
        value={combineOperator}
        onChange={onCombineOperatorChange}
      />
    </div>
  );
}
