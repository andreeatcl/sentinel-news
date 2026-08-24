import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

function quoteKeyword(term) {
  const clean = term.trim();
  if (!clean) return "";

  if (
    clean.includes(" OR ") ||
    clean.includes(" AND ") ||
    clean.includes(" NOT ")
  ) {
    return clean;
  }

  if (clean.includes(" ") && !(clean.startsWith('"') && clean.endsWith('"'))) {
    return `"${clean}"`;
  }

  return clean;
}

export default function KeywordQueryModal({
  isOpen,
  countryName,
  availableKeywords,
  onApply,
  onClose,
}) {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState("OR");
  const [customTerms, setCustomTerms] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [customOperator, setCustomOperator] = useState("OR");
  const [combineOperator, setCombineOperator] = useState("OR");
  const [includeCountryInQuery, setIncludeCountryInQuery] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedKeywords([]);
    setCustomTerms([]);
    setCustomInput("");
    setSelectedOperator("OR");
    setCustomOperator("OR");
    setCombineOperator("OR");
    setIncludeCountryInQuery(true);
  }, [isOpen]);

  const sortedKeywords = useMemo(
    () => [...(availableKeywords || [])].sort((a, b) => a.localeCompare(b)),
    [availableKeywords],
  );

  function toggleKeyword(keyword) {
    setSelectedKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword],
    );
  }

  function addCustomTerm() {
    const next = customInput.trim();
    if (!next || /\s/.test(next)) {
      return;
    }

    const existsInCountry = selectedKeywords.some(
      (item) => item.toLowerCase() === next.toLowerCase(),
    );
    const existsInCustom = customTerms.some(
      (item) => item.toLowerCase() === next.toLowerCase(),
    );

    if (!existsInCountry && !existsInCustom) {
      setCustomTerms((current) => [...current, next]);
    }

    setCustomInput("");
  }

  function removeCustomTerm(term) {
    setCustomTerms((current) => current.filter((item) => item !== term));
  }

  function selectAllKeywords() {
    setSelectedKeywords(sortedKeywords);
  }

  function deselectAllKeywords() {
    setSelectedKeywords([]);
  }

  function handleApply() {
    const selectedExpr = selectedKeywords
      .map((keyword) => quoteKeyword(keyword))
      .join(` ${selectedOperator} `);
    const customExpr = customTerms
      .map((keyword) => quoteKeyword(keyword))
      .join(` ${customOperator} `);

    let expression = "";
    if (selectedExpr && customExpr) {
      expression = `(${selectedExpr}) ${combineOperator} (${customExpr})`;
    } else {
      expression = selectedExpr || customExpr;
    }

    if (!includeCountryInQuery && !expression) {
      return;
    }

    onApply({
      expression,
      queryOptions: {
        includeCountry: includeCountryInQuery,
        overrideCountryKeywords: true,
      },
    });
    onClose();
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[92vw] max-w-3xl max-h-[85vh] bg-carbon-900 border border-carbon-700/80 rounded-lg flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-carbon-700/70 shrink-0">
          <div>
            <h2 className="font-display text-white tracking-widest text-lg leading-none">
              KEYWORD QUERY BUILDER
            </h2>
            <p className="text-[10px] font-mono text-carbon-500 mt-1 uppercase tracking-widest">
              {countryName} · pick keywords and combine with boolean logic
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-9 h-9 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-3 border-b border-carbon-700/50 shrink-0 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIncludeCountryInQuery((current) => !current)}
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
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="bg-carbon-800 border border-carbon-600/60 rounded text-[10px] font-mono text-white px-2 py-1 outline-none focus:border-signal-cyan/50"
          >
            <option value="OR">OR</option>
            <option value="AND">AND</option>
          </select>

          <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-wider">
            custom terms:
          </span>
          <select
            value={customOperator}
            onChange={(e) => setCustomOperator(e.target.value)}
            className="bg-carbon-800 border border-carbon-600/60 rounded text-[10px] font-mono text-white px-2 py-1 outline-none focus:border-signal-cyan/50"
          >
            <option value="OR">OR</option>
            <option value="AND">AND</option>
          </select>

          <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-wider">
            between groups:
          </span>
          <select
            value={combineOperator}
            onChange={(e) => setCombineOperator(e.target.value)}
            className="bg-carbon-800 border border-carbon-600/60 rounded text-[10px] font-mono text-white px-2 py-1 outline-none focus:border-signal-cyan/50"
          >
            <option value="OR">OR</option>
            <option value="AND">AND</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <p className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest">
                Country keyword options
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllKeywords}
                  className="text-[10px] font-mono font-bold text-carbon-300 border border-carbon-600/70 rounded px-2 py-1 hover:border-carbon-500 transition-colors"
                >
                  SELECT ALL
                </button>
                <button
                  type="button"
                  onClick={deselectAllKeywords}
                  className="text-[10px] font-mono font-bold text-carbon-400 border border-carbon-600/70 rounded px-2 py-1 hover:border-carbon-500 transition-colors"
                >
                  DESELECT ALL
                </button>
              </div>
            </div>

            {sortedKeywords.length === 0 ? (
              <div className="text-[11px] font-mono text-carbon-600 border border-carbon-700/60 rounded px-3 py-2">
                No predefined keywords available for this country.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sortedKeywords.map((keyword) => {
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
                        onChange={() => toggleKeyword(keyword)}
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

          <div>
            <p className="text-[10px] font-mono text-carbon-500 mb-2 uppercase tracking-widest">
              Add custom keyword
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTerm();
                  }
                }}
                placeholder="one word only"
                className="flex-1 bg-carbon-800 border border-carbon-600/60 rounded text-[11px] font-mono text-white px-3 py-2 outline-none placeholder:text-carbon-600 focus:border-signal-cyan/50"
              />
              <button
                type="button"
                onClick={addCustomTerm}
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
                    onClick={() => removeCustomTerm(term)}
                    className="text-[10px] font-mono border border-signal-amber/40 text-signal-amber bg-signal-amber/10 rounded px-2 py-1 hover:bg-signal-amber/20 transition-colors"
                  >
                    {term} ×
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-carbon-700/50 px-5 py-3 shrink-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-mono font-bold text-carbon-400 border border-carbon-600/70 rounded px-3 py-1.5 hover:border-carbon-500 transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="text-[10px] font-mono font-bold text-signal-cyan border border-signal-cyan/40 rounded px-3 py-1.5 hover:bg-signal-cyan/10 transition-colors"
          >
            APPLY QUERY
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
