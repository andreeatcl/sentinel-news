import { useEffect, useMemo, useState } from "react";
import { CAMEO_ROOT_CATEGORIES } from "../utils/cameoCategories";
import { TONE_LABELS } from "../utils/eventTone";
import { AccordionSection, Pill } from "./FilterAccordion";
import SortControl from "./SortControl";
import SearchBar from "./SearchBar";
import EventsList from "./EventsList";

const TIME_RANGES = ["48h", "7d", "30d"];

const EVENT_SORT_OPTIONS = [
  { value: "significance", label: "Significance" },
  { value: "date", label: "Date" },
  { value: "coverage", label: "Coverage" },
];

const LOAD_MORE_COOLDOWN_MS = 4000;

function toggleInList(list, value) {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function sameSet(a, b) {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((v) => setB.has(v));
}

function filtersEqual(a, b) {
  return (
    a.timeRange === b.timeRange &&
    a.sortBy === b.sortBy &&
    a.sortDir === b.sortDir &&
    sameSet(a.category, b.category) &&
    sameSet(a.tone, b.tone)
  );
}

function matchesKeyword(event, keyword) {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    event.headline,
    event.location,
    event.actor1?.label,
    event.actor2?.label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export default function EventsTab({
  selectedCountry,
  events,
  eventsLoading,
  eventsLoadingMore,
  eventsError,
  eventsHasMore,
  eventsFilters,
  onEventsFilterChange,
  onLoadMoreEvents,
  onSelectEvent,
}) {
  const [keyword, setKeyword] = useState("");
  const [loadMoreCooldown, setLoadMoreCooldown] = useState(false);
  const [draftFilters, setDraftFilters] = useState(eventsFilters);

  // reset keyword filter + draft when switching countries
  useEffect(() => {
    setKeyword("");
    setDraftFilters(eventsFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const visibleEvents = useMemo(
    () => events.filter((event) => matchesKeyword(event, keyword)),
    [events, keyword],
  );

  const isDirty = !filtersEqual(draftFilters, eventsFilters);

  function handleLoadMoreClick() {
    onLoadMoreEvents();
    setLoadMoreCooldown(true);
    setTimeout(() => setLoadMoreCooldown(false), LOAD_MORE_COOLDOWN_MS);
  }

  return (
    <>
      <SortControl
        value={draftFilters.sortBy}
        direction={draftFilters.sortDir}
        options={EVENT_SORT_OPTIONS}
        onChange={(sortBy) => setDraftFilters((f) => ({ ...f, sortBy }))}
        onToggleDirection={() =>
          setDraftFilters((f) => ({
            ...f,
            sortDir: f.sortDir === "asc" ? "desc" : "asc",
          }))
        }
      />

      <div className="shrink-0">
        <AccordionSection title="Time Range" defaultOpen>
          {TIME_RANGES.map((t) => (
            <Pill
              key={t}
              active={draftFilters.timeRange === t}
              onClick={() => setDraftFilters((f) => ({ ...f, timeRange: t }))}
            >
              {t}
            </Pill>
          ))}
        </AccordionSection>

        <AccordionSection
          title="Category"
          scrollX
          activeCount={draftFilters.category.length}
          totalCount={CAMEO_ROOT_CATEGORIES.length}
          onSelectAll={() =>
            setDraftFilters((f) => ({
              ...f,
              category: CAMEO_ROOT_CATEGORIES.map((c) => c.code),
            }))
          }
          onDeselectAll={() => setDraftFilters((f) => ({ ...f, category: [] }))}
        >
          {CAMEO_ROOT_CATEGORIES.map(({ code, label }) => (
            <Pill
              key={code}
              active={draftFilters.category.includes(code)}
              onClick={() =>
                setDraftFilters((f) => ({
                  ...f,
                  category: toggleInList(f.category, code),
                }))
              }
            >
              {label}
            </Pill>
          ))}
        </AccordionSection>

        <AccordionSection
          title="Tone"
          activeCount={draftFilters.tone.length}
          totalCount={Object.keys(TONE_LABELS).length}
          onSelectAll={() =>
            setDraftFilters((f) => ({ ...f, tone: Object.keys(TONE_LABELS) }))
          }
          onDeselectAll={() => setDraftFilters((f) => ({ ...f, tone: [] }))}
        >
          {Object.entries(TONE_LABELS).map(([value, label]) => (
            <Pill
              key={value}
              tone={value}
              active={draftFilters.tone.includes(value)}
              onClick={() =>
                setDraftFilters((f) => ({
                  ...f,
                  tone: toggleInList(f.tone, value),
                }))
              }
            >
              {label}
            </Pill>
          ))}
        </AccordionSection>

        {/* Client-side only (filters what's already loaded) — instant,
            no request, so it's live rather than gated behind Search */}
        <AccordionSection title="Keyword" activeCount={keyword ? 1 : 0}>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filter loaded events…"
            className="w-full bg-carbon-800 border border-carbon-600/60 text-white text-xs font-body rounded px-2.5 py-1.5 outline-none focus:border-signal-cyan/60 placeholder:text-carbon-500"
          />
        </AccordionSection>
      </div>

      {isDirty && (
        <SearchBar onSearch={() => onEventsFilterChange(draftFilters)} />
      )}

      <div className="flex-1 overflow-y-auto">
        <EventsList
          events={visibleEvents}
          loading={eventsLoading}
          error={eventsError}
          onSelectEvent={onSelectEvent}
        />
      </div>

      {events.length > 0 && (
        <div className="shrink-0 px-4 py-2 border-t border-carbon-700/50 space-y-2">
          <p className="text-[9px] font-mono text-carbon-600 text-center uppercase tracking-widest">
            {visibleEvents.length} of {events.length} events · powered by GDELT
          </p>
          {eventsHasMore && (
            <button
              onClick={handleLoadMoreClick}
              disabled={eventsLoadingMore || loadMoreCooldown}
              className="w-full text-[10px] font-mono font-bold text-carbon-300 border border-carbon-600/70 rounded px-3 py-1.5 hover:border-signal-cyan/60 hover:text-signal-cyan transition-colors disabled:opacity-40"
            >
              {eventsLoadingMore
                ? "LOADING…"
                : loadMoreCooldown
                  ? "WAIT A MOMENT…"
                  : "LOAD MORE"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
