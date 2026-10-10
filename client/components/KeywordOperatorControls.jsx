import { Select, Toggle } from "./ui/Field";

function OperatorSelect({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-carbon-400 whitespace-nowrap">{label}</span>
      <Select
        size="sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20"
      >
        <option value="OR">OR</option>
        <option value="AND">AND</option>
      </Select>
    </label>
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
    <div className="px-5 py-3 border-b border-carbon-800 shrink-0 flex items-center gap-x-5 gap-y-2.5 flex-wrap">
      <Toggle
        checked={includeCountryInQuery}
        onChange={onToggleIncludeCountry}
        label="Include country name"
      />
      <OperatorSelect
        label="Selected keywords"
        value={selectedOperator}
        onChange={onSelectedOperatorChange}
      />
      <OperatorSelect
        label="Custom terms"
        value={customOperator}
        onChange={onCustomOperatorChange}
      />
      <OperatorSelect
        label="Between groups"
        value={combineOperator}
        onChange={onCombineOperatorChange}
      />
    </div>
  );
}
