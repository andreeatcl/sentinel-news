import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { quoteKeyword } from "../utils/queryBuilder";
import KeywordGrid from "./KeywordGrid";
import KeywordOperatorControls from "./KeywordOperatorControls";
import CustomTermInput from "./CustomTermInput";

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
    // SINGLE words only
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

  // merging independent keyword groups using OR/AND operators
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

        <KeywordOperatorControls
          includeCountryInQuery={includeCountryInQuery}
          onToggleIncludeCountry={() =>
            setIncludeCountryInQuery((current) => !current)
          }
          selectedOperator={selectedOperator}
          onSelectedOperatorChange={setSelectedOperator}
          customOperator={customOperator}
          onCustomOperatorChange={setCustomOperator}
          combineOperator={combineOperator}
          onCombineOperatorChange={setCombineOperator}
        />

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <KeywordGrid
            keywords={sortedKeywords}
            selectedKeywords={selectedKeywords}
            onToggleKeyword={toggleKeyword}
            onSelectAll={selectAllKeywords}
            onDeselectAll={deselectAllKeywords}
          />

          <CustomTermInput
            customInput={customInput}
            onCustomInputChange={setCustomInput}
            onAddTerm={addCustomTerm}
            customTerms={customTerms}
            onRemoveTerm={removeCustomTerm}
          />
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
