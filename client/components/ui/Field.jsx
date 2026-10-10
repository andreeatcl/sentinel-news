import { forwardRef } from "react";
import { ChevronDownIcon } from "./icons";

const FIELD =
  "bg-carbon-850 border border-carbon-700 rounded-md text-carbon-100 placeholder:text-carbon-500 outline-none transition-colors hover:border-carbon-600 focus:border-carbon-400 focus-visible:ring-0";

const SIZES = {
  sm: "h-8 px-2.5 text-xs",
  md: "h-9 px-3 text-sm",
};

export const Input = forwardRef(function Input(
  { size = "md", className = "", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`${FIELD} ${SIZES[size]} min-w-0 ${className}`}
      {...rest}
    />
  );
});

export function Select({ size = "md", className = "", children, ...rest }) {
  return (
    <div className={`relative ${className}`}>
      <select
        className={`${FIELD} ${SIZES[size]} w-full appearance-none pr-8 cursor-pointer`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDownIcon className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-carbon-400 pointer-events-none" />
    </div>
  );
}

export function Eyebrow({ className = "", children }) {
  return (
    <p
      className={`text-2xs font-medium uppercase tracking-wider text-carbon-500 ${className}`}
    >
      {children}
    </p>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-[18px] rounded-full transition-colors ${
          checked ? "bg-carbon-100" : "bg-carbon-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-transform ${
            checked ? "translate-x-3.5 bg-carbon-950" : "bg-carbon-300"
          }`}
        />
      </button>
      <span className="text-xs text-carbon-200">{label}</span>
    </label>
  );
}
