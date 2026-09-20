export default function SearchBar({ onSearch }) {
  return (
    <div className="shrink-0 px-4 py-1.5 border-b border-carbon-700/50">
      <button
        type="button"
        onClick={onSearch}
        className="w-full text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded bg-signal-cyan/15 border border-signal-cyan/50 text-signal-cyan hover:bg-signal-cyan/25 transition-colors"
      >
        Search
      </button>
    </div>
  );
}
