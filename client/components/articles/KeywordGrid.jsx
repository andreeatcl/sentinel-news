import Button from "../ui/Button";
import { Eyebrow } from "../ui/Field";
import { CheckIcon } from "../ui/icons";

export default function KeywordGrid({
  keywords,
  selectedKeywords,
  onToggleKeyword,
  onSelectAll,
  onDeselectAll,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <Eyebrow>Country keywords</Eyebrow>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onSelectAll}>
            Select all
          </Button>
          <Button size="sm" variant="ghost" onClick={onDeselectAll}>
            Deselect all
          </Button>
        </div>
      </div>

      {keywords.length === 0 ? (
        <div className="text-sm text-carbon-500 border border-dashed border-carbon-700 rounded-lg px-3 py-3">
          No predefined keywords available for this country.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {keywords.map((keyword) => {
            const active = selectedKeywords.includes(keyword);
            return (
              <label
                key={keyword}
                className={`flex items-center gap-2.5 h-9 px-3 border rounded-md cursor-pointer select-none transition-colors ${
                  active
                    ? "border-carbon-300 bg-white/10"
                    : "border-carbon-800 bg-carbon-850 hover:border-carbon-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggleKeyword(keyword)}
                  className="sr-only peer"
                />
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-white/40 ${
                    active
                      ? "bg-white border-white text-carbon-950"
                      : "border-carbon-600"
                  }`}
                >
                  {active && <CheckIcon className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span
                  className={`text-xs truncate ${
                    active ? "text-white" : "text-carbon-300"
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
