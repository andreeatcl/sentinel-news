import { AccordionSection, Pill } from "../ui/FilterAccordion";
import SortControl from "../ui/SortControl";
import { Input, Select, Eyebrow } from "../ui/Field";

// everything the toolbar controls
export const DEFAULT_VIEW = {
  query: "",
  type: "all",
  tier: null,
  groupBy: "saved",
  sortField: "saved",
  sortDir: "desc",
};

export const CLEARED_FILTERS = { query: "", type: "all", tier: null };

export function activeFilterCount(view) {
  return (view.type !== "all" ? 1 : 0) + (view.tier ? 1 : 0);
}

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "article", label: "Articles" },
  { value: "event", label: "Events" },
];

const TIER_FILTERS = [
  { tier: "trusted", label: "Trusted" },
  { tier: "state-affiliated", label: "State media" },
];

const GROUP_OPTIONS = [
  { value: "saved", label: "Date saved" },
  { value: "published", label: "Date published" },
  { value: "topic", label: "Country / search" },
  { value: "source", label: "Source" },
  { value: "type", label: "Type" },
  { value: "none", label: "No grouping" },
];

const SORT_OPTIONS = [
  { value: "saved", label: "Date saved" },
  { value: "published", label: "Date published" },
  { value: "title", label: "Title" },
];

export default function FavoritesToolbar({ view, onChange }) {
  return (
    <>
      <div className="px-4 pt-3 pb-2.5 border-b border-carbon-800">
        <Input
          size="sm"
          type="search"
          value={view.query}
          onChange={(e) => onChange({ query: e.target.value })}
          placeholder="Search favorites…"
          aria-label="Search favorites"
          className="w-full"
        />
      </div>

      <SortControl
        value={view.sortField}
        direction={view.sortDir}
        options={SORT_OPTIONS}
        onChange={(sortField) => onChange({ sortField })}
        onToggleDirection={() =>
          onChange({ sortDir: view.sortDir === "asc" ? "desc" : "asc" })
        }
      />

      <AccordionSection
        title="Filter & group"
        activeCount={activeFilterCount(view)}
      >
        <div className="w-full space-y-3">
          <div>
            <Eyebrow className="mb-1.5">Type</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_FILTERS.map(({ value, label }) => (
                <Pill
                  key={value}
                  active={view.type === value}
                  onClick={() => onChange({ type: value })}
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow className="mb-1.5">Source</Eyebrow>
            <div className="flex flex-wrap gap-1.5">
              {TIER_FILTERS.map(({ tier, label }) => (
                <Pill
                  key={tier}
                  active={view.tier === tier}
                  onClick={() =>
                    onChange({ tier: view.tier === tier ? null : tier })
                  }
                >
                  {label}
                </Pill>
              ))}
            </div>
          </div>

          <label className="block w-1/2 pr-1">
            <Eyebrow className="mb-1.5">Group by</Eyebrow>
            <Select
              size="sm"
              value={view.groupBy}
              onChange={(e) => onChange({ groupBy: e.target.value })}
            >
              {GROUP_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </label>
        </div>
      </AccordionSection>
    </>
  );
}
