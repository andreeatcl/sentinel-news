import { useState, useMemo } from "react";
import sources from "../utils/sources.json";

// tailwind color stuff
const CATEGORY_BADGE_CLASSES = {
  general: "text-signal-cyan border-signal-cyan/40 bg-signal-cyan/10",
  business: "text-signal-amber border-signal-amber/40 bg-signal-amber/10",
  technology: "text-signal-green border-signal-green/40 bg-signal-green/10",
  sports: "text-signal-red border-signal-red/40 bg-signal-red/10",
  entertainment: "text-signal-amber border-signal-amber/40 bg-signal-amber/10",
  health: "text-signal-green border-signal-green/40 bg-signal-green/10",
  science: "text-signal-cyan border-signal-cyan/40 bg-signal-cyan/10",
};

function getCategoryBadgeClasses(category) {
  return CATEGORY_BADGE_CLASSES[category] || CATEGORY_BADGE_CLASSES.general;
}

export default function SourcesModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState("general");

  const categories = useMemo(() => {
    const cats = new Set(sources.sources.map((s) => s.category));
    return Array.from(cats).sort();
  }, []);

  const filteredSources = useMemo(() => {
    return sources.sources
      .filter((s) => s.category === selectedCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[90vw] max-w-4xl max-h-[85vh] bg-carbon-900 border border-carbon-700/80 rounded-lg flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-carbon-700/70 shrink-0">
          <div>
            <h1 className="font-display text-white tracking-widest text-xl leading-none">
              TOP NEWS SOURCES
            </h1>
            <p className="text-[10px] font-mono text-carbon-500 mt-1 uppercase tracking-widest">
              Verified publications featured in sentinel
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-carbon-500 hover:text-white transition-colors text-2xl leading-none w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-carbon-700/50 shrink-0 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded border whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? `bg-signal-cyan/20 border-signal-cyan/60 text-signal-cyan`
                  : "border-carbon-600/60 text-carbon-500 hover:border-carbon-500"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sources grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSources.map((source) => {
              const badgeClasses = getCategoryBadgeClasses(source.category);
              return (
                <div
                  key={source.id}
                  className="bg-carbon-800/50 border border-carbon-700/60 rounded p-4 hover:border-carbon-700 transition-all group hover:bg-carbon-800/70"
                >
                  {/* Source name */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-body font-bold text-white group-hover:text-signal-cyan transition-colors leading-tight max-w-[80%]">
                      {source.name}
                    </h3>
                    <span
                      className={`text-[8px] font-mono font-bold rounded px-1.5 py-0.5 border ${badgeClasses} uppercase tracking-wider whitespace-nowrap`}
                    >
                      {source.category}
                    </span>
                  </div>

                  {/* Country */}
                  <p className="text-[10px] font-mono text-carbon-600 mb-2 uppercase tracking-wider">
                    {source.country}
                  </p>

                  {/* Description */}
                  <p className="text-[11px] font-body text-carbon-400 line-clamp-2 mb-3 leading-relaxed">
                    {source.description}
                  </p>

                  {/* Visit link */}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-signal-cyan hover:text-white transition-colors inline-flex items-center gap-1 group/link"
                  >
                    VISIT
                    <span className="group-hover/link:translate-x-1 transition-transform">
                      →
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-carbon-700/50 px-6 py-3 text-center shrink-0">
          <p className="text-[10px] font-mono text-carbon-600 uppercase tracking-widest">
            {filteredSources.length} sources in {selectedCategory} category
          </p>
        </div>
      </div>
    </div>
  );
}
