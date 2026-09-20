import { useState } from "react";

export function AccordionSection({
  title,
  children,
  defaultOpen = false,
  activeCount = 0,
  totalCount = 0,
  onSelectAll,
  onDeselectAll,
  scrollX = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const allSelected = totalCount > 0 && activeCount === totalCount;
  const showSelectAllToggle = open && onSelectAll && onDeselectAll;

  return (
    <div className="border-b border-carbon-700/50">
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* A single button, not nested inside the select-all button below */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-carbon-400 hover:text-white transition-colors"
        >
          {title}
          {activeCount > 0 && (
            <span className="text-[9px] text-signal-cyan bg-signal-cyan/15 rounded-full px-1.5 leading-4">
              {activeCount}
            </span>
          )}
          <span
            className={`text-carbon-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>
        {showSelectAllToggle && (
          <button
            type="button"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="text-[9px] font-mono text-carbon-500 hover:text-signal-cyan underline underline-offset-2 transition-colors"
          >
            {allSelected ? "Clear all" : "Select all"}
          </button>
        )}
      </div>
      {open && (
        <div
          className={`px-4 pb-3 flex gap-1.5 ${
            scrollX ? "flex-nowrap overflow-x-auto no-scrollbar" : "flex-wrap"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const TONE_PILL_CLASS = {
  positive: "bg-signal-green/20 border-signal-green/60 text-signal-green",
  negative: "bg-signal-red/20 border-signal-red/60 text-signal-red",
  neutral: "bg-signal-amber/20 border-signal-amber/60 text-signal-amber",
};

export function Pill({ active, onClick, children, tone }) {
  const activeClass = tone
    ? TONE_PILL_CLASS[tone]
    : "bg-signal-cyan/20 border-signal-cyan/60 text-signal-cyan";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? activeClass
          : "bg-carbon-800/60 border-carbon-600/60 text-carbon-400 hover:border-carbon-500 hover:text-carbon-200"
      }`}
    >
      {children}
    </button>
  );
}
