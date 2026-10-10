import { useState, useMemo } from "react";
import sources from "../utils/sources.json";
import Modal from "./ui/Modal";
import { Pill } from "./FilterAccordion";
import { ExternalIcon } from "./ui/icons";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="xl"
      title="Top news sources"
      subtitle={`${filteredSources.length} verified publications in ${selectedCategory}`}
    >
      {/* Category tabs */}
      <div className="sticky top-0 z-10 flex items-center gap-1.5 px-5 py-3 bg-carbon-900 border-b border-carbon-800 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <Pill
            key={cat}
            active={selectedCategory === cat}
            onClick={() => setSelectedCategory(cat)}
          >
            <span className="capitalize">{cat}</span>
          </Pill>
        ))}
      </div>

      {/* Sources grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-5 py-4">
        {filteredSources.map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col bg-carbon-850 border border-carbon-800 rounded-lg p-4 hover:border-carbon-700 hover:bg-carbon-800 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-white leading-tight">
                {source.name}
              </h3>
              <ExternalIcon className="w-3.5 h-3.5 text-carbon-500 group-hover:text-white transition-colors shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-carbon-500 uppercase tracking-wider mt-1">
              {source.country}
            </p>
            <p className="text-xs text-carbon-400 line-clamp-2 leading-relaxed mt-2">
              {source.description}
            </p>
          </a>
        ))}
      </div>
    </Modal>
  );
}
