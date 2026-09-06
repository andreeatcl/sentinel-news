import { useState } from "react";

export default function TopBar({
  onSearch,
  loading,
  meta,
  activeQuery,
  onSourcesClick,
  onKeysClick,
  isMobile = false,
}) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) {
      onSearch({ topic: input.trim(), raw: true });
    }
  }

  const remaining =
    typeof meta?.apiCallsRemaining === "number" ? meta.apiCallsRemaining : "—";

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-[1000] flex gap-2 px-3 py-2 pointer-events-none ${
        isMobile ? "items-stretch" : "items-center"
      }`}
    >
      {/* Branding */}
      <div className="pointer-events-auto flex items-center gap-2 bg-carbon-900/95 border border-carbon-600/60 rounded px-2.5 py-2 backdrop-blur-sm shrink-0">
        <span className="w-2 h-2 rounded-full bg-signal-red pulse-dot" />
        <span className="font-display text-white tracking-widest text-base sm:text-lg leading-none">
          SENTINEL
        </span>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        className="pointer-events-auto flex-1 max-w-xl search-glow min-w-0"
      >
        <div className="flex items-center bg-carbon-900/95 border border-carbon-600/60 rounded backdrop-blur-sm overflow-hidden">
          <span className="pl-3 text-carbon-500 font-mono text-xs select-none text-signal-cyan">
            ⌕
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search global events… e.g. NATO, elections, sanctions"
            className="flex-1 bg-transparent text-white font-body text-sm px-3 py-2 outline-none placeholder:text-carbon-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 text-xs font-mono font-bold text-signal-cyan border-l border-carbon-600/60 hover:bg-carbon-700 transition-colors disabled:opacity-40"
          >
            {loading ? "..." : "SCAN"}
          </button>
        </div>
      </form>

      {/* API credit indicator */}
      <div className="pointer-events-auto hidden sm:flex items-center gap-2 bg-carbon-900/95 border border-carbon-600/60 rounded px-3 py-2 backdrop-blur-sm">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest">
            Credits
          </span>
          <span
            className={`text-xs font-mono font-bold ${
              typeof remaining === "number" && remaining < 20
                ? "text-signal-red"
                : typeof remaining === "number" && remaining < 50
                  ? "text-signal-amber"
                  : "text-signal-green"
            }`}
          >
            {remaining} / 100
          </span>
        </div>
        {meta?.cached && (
          <span className="text-[9px] font-mono text-signal-cyan border border-signal-cyan/30 rounded px-1 py-0.5 leading-none">
            CACHED
          </span>
        )}
        {meta?.keyUsed === "backup" && (
          <span className="text-[9px] font-mono text-signal-amber border border-signal-amber/30 rounded px-1 py-0.5 leading-none">
            BACKUP KEY
          </span>
        )}
      </div>

      {/* API keys button */}
      <button
        onClick={onKeysClick}
        className="pointer-events-auto flex items-center gap-2 bg-carbon-900/95 border border-carbon-600/60 rounded px-2.5 py-2 backdrop-blur-sm hover:border-signal-cyan/60 hover:bg-signal-cyan/5 transition-all group shrink-0"
        title="API keys"
      >
        <span className="text-[10px] font-mono text-carbon-400 group-hover:text-signal-cyan uppercase tracking-widest transition-colors">
          🔑
        </span>
      </button>

      {/* Top Sources button */}
      <button
        onClick={onSourcesClick}
        className="pointer-events-auto flex items-center gap-2 bg-carbon-900/95 border border-carbon-600/60 rounded px-2.5 py-2 backdrop-blur-sm hover:border-signal-cyan/60 hover:bg-signal-cyan/5 transition-all group shrink-0"
      >
        <span className="w-2 h-2 rounded-full bg-signal-green" />
        <span className="text-[10px] font-mono text-carbon-400 group-hover:text-signal-cyan uppercase tracking-widest transition-colors hidden sm:inline">
          Sources
        </span>
      </button>

      {/* Active query label */}
      {activeQuery && (
        <div
          className="pointer-events-auto hidden lg:block group relative bg-carbon-900/95 border border-carbon-600/40 rounded px-3 py-2 backdrop-blur-sm max-w-xs"
          title={activeQuery}
          tabIndex={0}
        >
          <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest block">
            Query
          </span>
          <span className="text-xs font-mono text-signal-cyan truncate block">
            {activeQuery}
          </span>

          <div className="pointer-events-none absolute right-0 top-full mt-2 w-[540px] max-w-[75vw] p-3 bg-carbon-900 border border-carbon-600/70 rounded shadow-lg z-[1001] opacity-0 invisible transition-opacity duration-150 group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible">
            <span className="text-[10px] font-mono text-carbon-500 uppercase tracking-widest block mb-1">
              Full query
            </span>
            <p className="text-[11px] font-mono text-signal-cyan whitespace-pre-wrap break-words leading-relaxed max-h-44 overflow-y-auto">
              {activeQuery}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
