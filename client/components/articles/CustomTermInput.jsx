import Button from "../ui/Button";
import { Eyebrow, Input } from "../ui/Field";
import { CloseIcon } from "../ui/icons";

export default function CustomTermInput({
  customInput,
  onCustomInputChange,
  onAddTerm,
  customTerms,
  onRemoveTerm,
}) {
  return (
    <div>
      <Eyebrow className="mb-2.5">Custom keyword</Eyebrow>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={customInput}
          onChange={(e) => onCustomInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddTerm();
            }
          }}
          placeholder="One word only"
          className="flex-1"
        />
        <Button onClick={onAddTerm}>Add</Button>
      </div>
      <p className="text-xs text-carbon-500 mt-2">
        Press Enter or Add to append the word to this query only.
      </p>

      {customTerms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {customTerms.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onRemoveTerm(term)}
              title={`Remove ${term}`}
              className="inline-flex items-center gap-1 h-7 pl-3 pr-2 rounded-full border border-carbon-700 bg-carbon-850 text-xs text-carbon-100 hover:border-carbon-600 hover:text-white transition-colors"
            >
              {term}
              <CloseIcon className="w-3 h-3 text-carbon-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
