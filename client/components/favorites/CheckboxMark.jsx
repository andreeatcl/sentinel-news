import { CheckIcon } from "../ui/icons";

export default function CheckboxMark({ checked }) {
  return (
    <span
      className={`w-4 h-4 shrink-0 inline-flex items-center justify-center rounded border transition-colors ${
        checked
          ? "bg-carbon-100 border-carbon-100 text-carbon-950"
          : "border-carbon-600"
      }`}
    >
      {checked && <CheckIcon className="w-3 h-3" strokeWidth={3} />}
    </span>
  );
}
