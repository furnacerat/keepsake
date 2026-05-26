import { ChevronDown, ChevronUp, Heart, Sparkles, Star, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeepsakeTimelineItem } from '../components/KeepsakeTimelineItem';
import { PhotoTimelineItem } from '../components/PhotoTimelineItem';
import { getTimelineItems, type UnifiedTimelineItem } from '../services/memoryStorage';

type TimelineSort = 'newest' | 'oldest' | 'meaningful' | 'favorites';

type TimelineFilters = {
  people: string[];
  tags: string[];
  events: string[];
  meaningfulOnly: boolean;
  favoritesOnly: boolean;
};

type MonthGroup = {
  key: string;
  label: string;
  items: UnifiedTimelineItem[];
};

type YearGroup = {
  year: string;
  months: MonthGroup[];
};

const sortOptions: Array<{ label: string; value: TimelineSort }> = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Most meaningful', value: 'meaningful' },
  { label: 'Favorites first', value: 'favorites' },
];

function formatMonth(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(date));
}

function getYear(date: string) {
  return String(new Date(date).getFullYear());
}

function getMonthKey(date: string) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
    first.localeCompare(second),
  );
}

function sortTimelineItems(items: UnifiedTimelineItem[], sort: TimelineSort) {
  return items.slice().sort((first, second) => {
    if (sort === 'oldest') {
      return new Date(first.date).getTime() - new Date(second.date).getTime();
    }

    if (sort === 'meaningful') {
      return (
        Number(second.meaningful) - Number(first.meaningful) ||
        Number(second.favorite) - Number(first.favorite) ||
        new Date(second.date).getTime() - new Date(first.date).getTime()
      );
    }

    if (sort === 'favorites') {
      return (
        Number(second.favorite) - Number(first.favorite) ||
        Number(second.meaningful) - Number(first.meaningful) ||
        new Date(second.date).getTime() - new Date(first.date).getTime()
      );
    }

    return new Date(second.date).getTime() - new Date(first.date).getTime();
  });
}

function filterTimelineItems(items: UnifiedTimelineItem[], filters: TimelineFilters) {
  return items.filter((item) => {
    if (filters.meaningfulOnly && !item.meaningful) {
      return false;
    }

    if (filters.favoritesOnly && !item.favorite) {
      return false;
    }

    if (filters.people.length > 0 && !filters.people.some((person) => item.people.includes(person))) {
      return false;
    }

    if (filters.tags.length > 0 && !filters.tags.some((tag) => item.tags.includes(tag))) {
      return false;
    }

    if (
      filters.events.length > 0 &&
      (!item.eventTag || !filters.events.some((eventTag) => item.eventTag === eventTag))
    ) {
      return false;
    }

    return true;
  });
}

function groupByYearAndMonth(items: UnifiedTimelineItem[]): YearGroup[] {
  const grouped = new Map<string, Map<string, MonthGroup>>();

  items.forEach((item) => {
    const year = getYear(item.date);
    const monthKey = getMonthKey(item.date);

    if (!grouped.has(year)) {
      grouped.set(year, new Map());
    }

    const months = grouped.get(year)!;
    if (!months.has(monthKey)) {
      months.set(monthKey, {
        key: monthKey,
        label: formatMonth(item.date),
        items: [],
      });
    }

    months.get(monthKey)!.items.push(item);
  });

  return Array.from(grouped.entries()).map(([year, months]) => ({
    year,
    months: Array.from(months.values()),
  }));
}

function groupByEvent(items: UnifiedTimelineItem[]) {
  const clusters: Array<{ key: string; eventTag?: string; items: UnifiedTimelineItem[] }> = [];
  const byEvent = new Map<string, UnifiedTimelineItem[]>();
  const unclustered: UnifiedTimelineItem[] = [];

  items.forEach((item) => {
    if (!item.eventTag) {
      unclustered.push(item);
      return;
    }

    byEvent.set(item.eventTag, [...(byEvent.get(item.eventTag) ?? []), item]);
  });

  byEvent.forEach((eventItems, eventTag) => {
    clusters.push({ key: `event-${eventTag}`, eventTag, items: eventItems });
  });

  unclustered.forEach((item) => {
    clusters.push({ key: item.id, items: [item] });
  });

  return clusters.sort(
    (first, second) =>
      new Date(second.items[0].date).getTime() - new Date(first.items[0].date).getTime(),
  );
}

function MultiSelectFilter({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <details className="rounded-2xl bg-white/75 p-3 shadow-soft">
      <summary className="cursor-pointer text-sm font-extrabold text-keepsake-roseDeep">
        {label} {values.length > 0 ? `(${values.length})` : ''}
      </summary>
      <div className="mt-3 grid max-h-44 gap-2 overflow-auto pr-1">
        {options.length === 0 ? (
          <p className="text-sm text-keepsake-muted">No options yet</p>
        ) : (
          options.map((option) => (
            <label className="flex items-center gap-2 text-sm font-semibold text-keepsake-muted" key={option}>
              <input
                className="h-4 w-4 accent-keepsake-roseDeep"
                type="checkbox"
                checked={values.includes(option)}
                onChange={(event) => {
                  if (event.target.checked) {
                    onChange([...values, option]);
                  } else {
                    onChange(values.filter((value) => value !== option));
                  }
                }}
              />
              {option}
            </label>
          ))
        )}
      </div>
    </details>
  );
}

export function TimelineScreen() {
  const navigate = useNavigate();
  const yearRefs = useRef<Record<string, HTMLElement | null>>({});
  const longPressTimer = useRef<number | null>(null);
  const allItems = useMemo(() => getTimelineItems(), []);
  const [filters, setFilters] = useState<TimelineFilters>({
    people: [],
    tags: [],
    events: [],
    meaningfulOnly: false,
    favoritesOnly: false,
  });
  const [sort, setSort] = useState<TimelineSort>('newest');
  const [selectionMode, setSelectionMode] = useState(false);
  const [pointA, setPointA] = useState<number | null>(null);
  const [pointB, setPointB] = useState<number | null>(null);
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(() => new Set());

  const peopleOptions = useMemo(() => uniqueSorted(allItems.flatMap((item) => item.people)), [allItems]);
  const tagOptions = useMemo(() => uniqueSorted(allItems.flatMap((item) => item.tags)), [allItems]);
  const eventOptions = useMemo(
    () => uniqueSorted(allItems.map((item) => item.eventTag ?? '')),
    [allItems],
  );

  const visibleItems = useMemo(
    () => sortTimelineItems(filterTimelineItems(allItems, filters), sort),
    [allItems, filters, sort],
  );
  const groupedItems = useMemo(() => groupByYearAndMonth(visibleItems), [visibleItems]);
  const years = groupedItems.map((group) => group.year);
  const selectedRange =
    pointA !== null && pointB !== null
      ? [Math.min(pointA, pointB), Math.max(pointA, pointB)]
      : null;
  const selectedRangeItems = selectedRange
    ? visibleItems.slice(selectedRange[0], selectedRange[1] + 1)
    : [];

  function getItemIndex(itemId: string) {
    return visibleItems.findIndex((item) => item.id === itemId);
  }

  function handleSelectPoint(itemId: string) {
    const itemIndex = getItemIndex(itemId);
    if (itemIndex < 0) {
      return;
    }

    if (!selectionMode) {
      return;
    }

    if (pointA === null || (pointA !== null && pointB !== null)) {
      setPointA(itemIndex);
      setPointB(null);
      return;
    }

    setPointB(itemIndex);
  }

  function handleLongPressSelect(itemId: string) {
    const itemIndex = getItemIndex(itemId);
    if (itemIndex < 0) {
      return;
    }

    longPressTimer.current = window.setTimeout(() => {
      setSelectionMode(true);
      setPointA(itemIndex);
      setPointB(null);
    }, 450);
  }

  function clearLongPress() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function clearSelection() {
    setSelectionMode(false);
    setPointA(null);
    setPointB(null);
  }

  function isRangeSelected(itemId: string) {
    if (!selectedRange) {
      return pointA === getItemIndex(itemId);
    }

    const itemIndex = getItemIndex(itemId);
    return itemIndex >= selectedRange[0] && itemIndex <= selectedRange[1];
  }

  function jumpToYear(year: string) {
    yearRefs.current[year]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Timeline 2.0
        </p>
        <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-keepsake-ink md:text-5xl lg:text-6xl">
          Your life story, in order.
        </h1>
        <p className="mt-5 text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
          Photos, keepsakes, events, and meaningful moments gathered into one chronological story.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-4 md:sticky md:top-28 md:self-start">
          <div className="hidden rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-4 shadow-keepsake md:block">
            <p className="font-heading text-2xl font-bold text-keepsake-ink">Jump to Year</p>
            <div className="mt-4 grid gap-2">
              {years.map((year) => (
                <button
                  className="rounded-full bg-keepsake-blush px-4 py-2 text-left text-sm font-extrabold text-keepsake-roseDeep transition hover:bg-keepsake-parchment"
                  key={year}
                  type="button"
                  onClick={() => jumpToYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2 rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-4 shadow-keepsake md:hidden">
            <span className="text-sm font-extrabold text-keepsake-roseDeep">Jump to Year</span>
            <select
              className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink"
              onChange={(event) => jumpToYear(event.target.value)}
            >
              <option value="">Choose year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-4 rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-4 shadow-keepsake md:grid-cols-2 md:p-5 lg:grid-cols-3">
            <MultiSelectFilter
              label="People"
              options={peopleOptions}
              values={filters.people}
              onChange={(people) => setFilters({ ...filters, people })}
            />
            <MultiSelectFilter
              label="Tags"
              options={tagOptions}
              values={filters.tags}
              onChange={(tags) => setFilters({ ...filters, tags })}
            />
            <MultiSelectFilter
              label="Events"
              options={eventOptions}
              values={filters.events}
              onChange={(events) => setFilters({ ...filters, events })}
            />
            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-keepsake-roseDeep">Sort</span>
              <select
                className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink"
                value={sort}
                onChange={(event) => setSort(event.target.value as TimelineSort)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/50 px-3 py-2 text-sm font-bold text-keepsake-roseDeep">
              <input
                className="h-4 w-4 accent-keepsake-roseDeep"
                type="checkbox"
                checked={filters.meaningfulOnly}
                onChange={(event) => setFilters({ ...filters, meaningfulOnly: event.target.checked })}
              />
              Meaningful only
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/50 px-3 py-2 text-sm font-bold text-keepsake-roseDeep">
              <input
                className="h-4 w-4 accent-keepsake-roseDeep"
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(event) => setFilters({ ...filters, favoritesOnly: event.target.checked })}
              />
              Favorites only
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className={[
                'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-extrabold shadow-soft transition',
                selectionMode
                  ? 'bg-keepsake-roseDeep text-white'
                  : 'bg-white/80 text-keepsake-roseDeep hover:bg-keepsake-blush',
              ].join(' ')}
              type="button"
              onClick={() => {
                setSelectionMode(true);
                setPointA(null);
                setPointB(null);
              }}
            >
              Start Selection
            </button>
            {selectionMode ? (
              <p className="text-sm font-bold text-keepsake-muted">
                {pointA === null ? 'Choose Point A' : pointB === null ? 'Choose Point B' : 'Range selected'}
              </p>
            ) : null}
          </div>

          {selectedRangeItems.length > 0 ? (
            <div className="sticky top-24 z-10 flex flex-col gap-3 rounded-[1.35rem] border border-keepsake-gold/30 bg-keepsake-ink p-4 text-white shadow-keepsake md:flex-row md:items-center md:justify-between">
              <p className="font-heading text-2xl font-bold leading-none">
                Selected Range: {selectedRangeItems.length} items
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-keepsake-roseDeep"
                  type="button"
                  onClick={() =>
                    navigate(`/create?type=scrapbook&timelineIds=${selectedRangeItems.map((item) => item.id).join(',')}`)
                  }
                >
                  Create Scrapbook from Range
                </button>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
                  type="button"
                  onClick={clearSelection}
                  aria-label="Clear selection"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          {groupedItems.length === 0 ? (
            <div className="rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-6 shadow-keepsake">
              <p className="font-heading text-2xl font-bold text-keepsake-ink">No timeline moments yet.</p>
              <p className="mt-2 text-sm leading-6 text-keepsake-muted">
                Add photos to the timeline from Memory Box or create a keepsake to begin.
              </p>
            </div>
          ) : (
            <div className="grid gap-10">
              {groupedItems.map((yearGroup) => (
                <section
                  key={yearGroup.year}
                  ref={(node) => {
                    yearRefs.current[yearGroup.year] = node;
                  }}
                >
                  <h2 className="font-heading text-[2.35rem] font-bold leading-none text-keepsake-ink md:text-5xl">
                    {yearGroup.year}
                  </h2>
                  <div className="mt-5 grid gap-8">
                    {yearGroup.months.map((monthGroup) => (
                      <section key={monthGroup.key}>
                        <h3 className="mb-4 text-sm font-extrabold uppercase tracking-[0.08em] text-keepsake-roseDeep">
                          {yearGroup.year} — {monthGroup.label}
                        </h3>
                        <div className="grid gap-5">
                          {groupByEvent(monthGroup.items).map((cluster) => {
                            const isCollapsed = collapsedEvents.has(cluster.key);
                            const isEventCluster = Boolean(cluster.eventTag);
                            const visibleClusterItems = isCollapsed ? [] : cluster.items;

                            return (
                              <section key={cluster.key} className="grid gap-4">
                                {isEventCluster ? (
                                  <div className="rounded-[1.35rem] border border-keepsake-gold/20 bg-keepsake-blush/60 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
                                          Life Chapter
                                        </p>
                                        <h4 className="mt-1 font-heading text-3xl font-bold leading-none text-keepsake-ink">
                                          {cluster.eventTag}
                                        </h4>
                                        <p className="mt-2 text-sm font-semibold text-keepsake-muted">
                                          {cluster.items.length} timeline moments
                                        </p>
                                      </div>
                                      <button
                                        className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-keepsake-roseDeep shadow-soft"
                                        type="button"
                                        onClick={() => {
                                          setCollapsedEvents((current) => {
                                            const next = new Set(current);
                                            if (next.has(cluster.key)) {
                                              next.delete(cluster.key);
                                            } else {
                                              next.add(cluster.key);
                                            }
                                            return next;
                                          });
                                        }}
                                        aria-label={isCollapsed ? 'Expand event cluster' : 'Collapse event cluster'}
                                      >
                                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                      </button>
                                    </div>
                                  </div>
                                ) : null}

                                {visibleClusterItems.length > 0 ? (
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                                    {visibleClusterItems.map((item) => {
                                      const isSelected = isRangeSelected(item.id);
                                      const commonProps = {
                                        isRangeSelected: isSelected,
                                        selectionMode,
                                        onSelectPoint: () => handleSelectPoint(item.id),
                                      };

                                      return (
                                        <div
                                          key={item.id}
                                          onPointerDown={() => handleLongPressSelect(item.id)}
                                          onPointerUp={clearLongPress}
                                          onPointerCancel={clearLongPress}
                                        >
                                          {item.type === 'photo' ? (
                                            <PhotoTimelineItem memory={item.memory} {...commonProps} />
                                          ) : (
                                            <KeepsakeTimelineItem keepsake={item.keepsake} {...commonProps} />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </section>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
