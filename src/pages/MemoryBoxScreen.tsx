import { Archive, Camera, Film, ImagePlus, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent, PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiSelectActionBar } from '../components/MultiSelectActionBar';
import type { MemoryItem } from '../models/memory';
import {
  createMemoryItems,
  getMemoryItems,
  updateMultipleMemoryItems,
} from '../services/memoryStorage';

type MemoryView = 'film' | 'filed' | 'timeline';
type MemorySort = 'newest' | 'oldest' | 'meaningful' | 'favorites';

type MemoryFilters = {
  query: string;
  person: string;
  tag: string;
  location: string;
  eventTag: string;
  startDate: string;
  endDate: string;
  meaningfulOnly: boolean;
  favoritesOnly: boolean;
};

const viewOptions: Array<{ label: string; value: MemoryView }> = [
  { label: 'Film Roll', value: 'film' },
  { label: 'Filing Drawer', value: 'filed' },
  { label: 'Timeline Photos', value: 'timeline' },
];

const viewCopy = {
  film: {
    title: 'Film Roll',
    description: 'Photos waiting to be developed',
    emptyTitle: 'Your Film Roll is empty.',
    emptyDescription: 'Upload or take a photo and it will wait here until you choose what it becomes.',
  },
  filed: {
    title: 'Filing Drawer',
    description: 'Raw memories you decided to store',
    emptyTitle: 'Nothing in the Filing Drawer yet.',
    emptyDescription: 'Review a photo from the Film Roll and file it for quiet storage.',
  },
  timeline: {
    title: 'Timeline Photos',
    description: 'Photos curated for your memory timeline',
    emptyTitle: 'No timeline photos yet.',
    emptyDescription: 'Choose a photo from the Film Roll and add it to the timeline when it feels meaningful.',
  },
} satisfies Record<MemoryView, { title: string; description: string; emptyTitle: string; emptyDescription: string }>;

const eventFilterOptions = [
  '',
  'Birthday',
  'Vacation',
  'Anniversary',
  'Holiday',
  'Graduation',
  'Everyday Moment',
  'Family Gathering',
  'Custom',
];

const sortOptions: Array<{ label: string; value: MemorySort }> = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Most meaningful', value: 'meaningful' },
  { label: 'Favorites first', value: 'favorites' },
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function matchesText(value: string | undefined, query: string) {
  return (value ?? '').toLowerCase().includes(query.toLowerCase());
}

function filterMemories(items: MemoryItem[], view: MemoryView, filters: MemoryFilters) {
  return items.filter((item) => {
    if (view === 'film' && (item.isFiled || item.isOnTimeline)) {
      return false;
    }

    if (view === 'filed' && !item.isFiled) {
      return false;
    }

    if (view === 'timeline' && !item.isOnTimeline) {
      return false;
    }

    const query = filters.query.trim().toLowerCase();
    if (
      query &&
      ![
        item.location,
        item.eventTag,
        item.notes,
        ...item.tags,
        ...item.people,
        new Date(item.createdAt).toLocaleDateString(),
      ].some((value) => matchesText(value, query))
    ) {
      return false;
    }

    if (filters.person && !item.people.some((person) => matchesText(person, filters.person))) {
      return false;
    }

    if (filters.tag && !item.tags.some((tag) => matchesText(tag, filters.tag))) {
      return false;
    }

    if (filters.location && !matchesText(item.location, filters.location)) {
      return false;
    }

    if (filters.eventTag && filters.eventTag !== 'Custom' && item.eventTag !== filters.eventTag) {
      return false;
    }

    if (filters.eventTag === 'Custom' && (!item.eventTag || eventFilterOptions.includes(item.eventTag))) {
      return false;
    }

    if (filters.meaningfulOnly && !item.meaningful) {
      return false;
    }

    if (filters.favoritesOnly && !item.favorite) {
      return false;
    }

    const createdDate = item.createdAt.slice(0, 10);
    if (filters.startDate && createdDate < filters.startDate) {
      return false;
    }

    if (filters.endDate && createdDate > filters.endDate) {
      return false;
    }

    return true;
  });
}

function sortMemories(items: MemoryItem[], sort: MemorySort) {
  return items.slice().sort((first, second) => {
    if (sort === 'oldest') {
      return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
    }

    if (sort === 'meaningful') {
      return Number(second.meaningful) - Number(first.meaningful) ||
        Number(second.favorite) - Number(first.favorite) ||
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    }

    if (sort === 'favorites') {
      return Number(second.favorite) - Number(first.favorite) ||
        Number(second.meaningful) - Number(first.meaningful) ||
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    }

    return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
  });
}

function FilterFields({
  filters,
  onChange,
}: {
  filters: MemoryFilters;
  onChange: (filters: MemoryFilters) => void;
}) {
  return (
    <div className="grid gap-3">
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          People
        </span>
        <input
          className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
          value={filters.person}
          onChange={(event) => onChange({ ...filters, person: event.target.value })}
          placeholder="Search people"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Tags
        </span>
        <input
          className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
          value={filters.tag}
          onChange={(event) => onChange({ ...filters, tag: event.target.value })}
          placeholder="Search tags"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Location
        </span>
        <input
          className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
          value={filters.location}
          onChange={(event) => onChange({ ...filters, location: event.target.value })}
          placeholder="Place or city"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Event Type
        </span>
        <select
          className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
          value={filters.eventTag}
          onChange={(event) => onChange({ ...filters, eventTag: event.target.value })}
        >
          {eventFilterOptions.map((option) => (
            <option key={option} value={option}>
              {option || 'Any event'}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            From
          </span>
          <input
            className="min-h-11 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
          />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            To
          </span>
          <input
            className="min-h-11 w-full min-w-0 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
          />
        </label>
      </div>
      <div className="grid gap-2">
        <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/50 px-3 py-2 text-sm font-bold text-keepsake-roseDeep">
          <input
            className="h-4 w-4 accent-keepsake-roseDeep"
            type="checkbox"
            checked={filters.meaningfulOnly}
            onChange={(event) => onChange({ ...filters, meaningfulOnly: event.target.checked })}
          />
          Meaningful only
        </label>
        <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/50 px-3 py-2 text-sm font-bold text-keepsake-roseDeep">
          <input
            className="h-4 w-4 accent-keepsake-roseDeep"
            type="checkbox"
            checked={filters.favoritesOnly}
            onChange={(event) => onChange({ ...filters, favoritesOnly: event.target.checked })}
          />
          Favorites only
        </label>
      </div>
    </div>
  );
}

export function MemoryBoxScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getMemoryItems());
  const [view, setView] = useState<MemoryView>('film');
  const [sort, setSort] = useState<MemorySort>('newest');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [isPointerSelecting, setIsPointerSelecting] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const [filters, setFilters] = useState<MemoryFilters>({
    query: '',
    person: '',
    tag: '',
    location: '',
    eventTag: '',
    startDate: '',
    endDate: '',
    meaningfulOnly: false,
    favoritesOnly: false,
  });

  const filteredItems = useMemo(
    () => sortMemories(filterMemories(items, view, filters), sort),
    [filters, items, sort, view],
  );
  const activeViewCopy = viewCopy[view];
  const selectedCount = selectedIds.size;

  function refreshItems() {
    setItems(getMemoryItems());
  }

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setIsMultiSelectMode(false);
    setLastSelectedIndex(null);
    setIsPointerSelecting(false);
  }

  function toggleSelection(id: string, index: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setLastSelectedIndex(index);
  }

  function selectRange(index: number) {
    setIsMultiSelectMode(true);
    setSelectedIds((current) => {
      const next = new Set(current);
      const start = lastSelectedIndex ?? index;
      const [from, to] = start < index ? [start, index] : [index, start];
      filteredItems.slice(from, to + 1).forEach((item) => next.add(item.id));
      return next;
    });
    setLastSelectedIndex(index);
  }

  function addSelection(id: string, index: number) {
    setSelectedIds((current) => new Set(current).add(id));
    setLastSelectedIndex(index);
  }

  function handleTilePointerDown(event: PointerEvent<HTMLButtonElement>, item: MemoryItem, index: number) {
    if (event.shiftKey) {
      event.preventDefault();
      selectRange(index);
      return;
    }

    if (isMultiSelectMode) {
      setIsPointerSelecting(true);
      toggleSelection(item.id, index);
      return;
    }

    if (event.pointerType === 'touch' || event.pointerType === 'pen' || event.pointerType === 'mouse') {
      const delay = event.pointerType === 'mouse' ? 220 : 450;
      longPressTimer.current = window.setTimeout(() => {
        setIsMultiSelectMode(true);
        setIsPointerSelecting(true);
        addSelection(item.id, index);
      }, delay);
    }
  }

  function handleTilePointerEnter(item: MemoryItem, index: number) {
    if (!isPointerSelecting || !isMultiSelectMode) {
      return;
    }

    addSelection(item.id, index);
  }

  function handleTilePointerUp() {
    clearLongPressTimer();
    setIsPointerSelecting(false);
  }

  function handleTileClick(item: MemoryItem, index: number) {
    clearLongPressTimer();

    if (isMultiSelectMode) {
      return;
    }

    navigate(`/memory-box/${item.id}`);
    setLastSelectedIndex(index);
  }

  function batchUpdate(updates: Parameters<typeof updateMultipleMemoryItems>[1]) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      return;
    }

    updateMultipleMemoryItems(ids, updates);
    refreshItems();
    clearSelection();
  }

  function parseBatchValues(value: string | null) {
    return (value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function handleTagPeople() {
    const people = parseBatchValues(window.prompt('Add people, separated by commas'));
    if (people.length === 0) {
      return;
    }

    batchUpdate((item) => ({ people: Array.from(new Set([...item.people, ...people])) }));
  }

  function handleAddTags() {
    const tags = parseBatchValues(window.prompt('Add tags, separated by commas'));
    if (tags.length === 0) {
      return;
    }

    batchUpdate((item) => ({ tags: Array.from(new Set([...item.tags, ...tags])) }));
  }

  function handleSetEventTag() {
    const eventTag = window.prompt('Set event tag');
    if (eventTag === null) {
      return;
    }

    batchUpdate({ eventTag: eventTag.trim() });
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    const uploaded = await Promise.all(
      files.map(async (file) => ({
        src: await readFileAsDataUrl(file),
        createdAt: new Date(file.lastModified || Date.now()).toISOString(),
        location: '',
        tags: [],
        people: [],
        notes: '',
        meaningful: false,
        favorite: false,
        eventTag: '',
        isFiled: false,
        isOnTimeline: false,
      })),
    );

    createMemoryItems(uploaded);
    refreshItems();
    event.target.value = '';
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            Private Archive
          </p>
          <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-keepsake-ink md:text-5xl lg:text-6xl">
            Memory Box
          </h1>
          <p className="mt-5 text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
            Your undeveloped moments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:w-auto">
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-keepsake-roseDeep px-5 text-sm font-extrabold text-white shadow-soft transition hover:bg-keepsake-rose md:text-base">
            <ImagePlus size={19} strokeWidth={2.4} aria-hidden="true" />
            Upload Photos
            <input className="sr-only" type="file" accept="image/*" multiple onChange={handleUpload} />
          </label>
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-keepsake-roseDeep shadow-soft transition hover:bg-keepsake-blush md:text-base">
            <Camera size={19} strokeWidth={2.4} aria-hidden="true" />
            Take Photo
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-5 shadow-keepsake md:block">
          <p className="mb-4 flex items-center gap-2 font-heading text-2xl font-bold text-keepsake-ink">
            <Archive size={20} aria-hidden="true" />
            Filters
          </p>
          <FilterFields filters={filters} onChange={setFilters} />
        </aside>

        <div className="space-y-5">
          <MultiSelectActionBar
            selectedCount={selectedCount}
            onAddTags={handleAddTags}
            onAddToFilingDrawer={() => batchUpdate({ isFiled: true, isOnTimeline: false })}
            onAddToTimeline={() => batchUpdate({ isFiled: false, isOnTimeline: true })}
            onClearSelection={clearSelection}
            onCreateKeepsake={() =>
              navigate(`/create?type=photo-memory&photoIds=${Array.from(selectedIds).join(',')}`)
            }
            onMarkFavorite={() => batchUpdate({ favorite: true })}
            onMarkMeaningful={() => batchUpdate({ meaningful: true })}
            onSetEventTag={handleSetEventTag}
            onTagPeople={handleTagPeople}
          />

          <div className="grid gap-3 rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-4 shadow-keepsake md:p-5">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-keepsake-muted" size={18} />
              <input
                className="min-h-12 w-full rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream py-2 pl-10 pr-3 text-base font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
                placeholder="Search photos, tags, people..."
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              {viewOptions.map((option) => (
                <button
                  className={[
                    'min-h-10 rounded-full px-2 text-xs font-extrabold transition md:text-sm',
                    view === option.value
                      ? 'bg-keepsake-roseDeep text-white shadow-soft'
                      : 'bg-keepsake-blush/70 text-keepsake-roseDeep hover:bg-keepsake-blush',
                  ].join(' ')}
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="grid gap-2 md:max-w-xs">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
                Sort
              </span>
              <select
                className="min-h-11 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-3 text-sm font-semibold text-keepsake-ink outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                value={sort}
                onChange={(event) => setSort(event.target.value as MemorySort)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <details className="rounded-2xl bg-keepsake-blush/50 p-4 md:hidden">
              <summary className="cursor-pointer text-sm font-extrabold text-keepsake-roseDeep">
                Filters
              </summary>
              <div className="mt-4">
                <FilterFields filters={filters} onChange={setFilters} />
              </div>
            </details>
          </div>

          <section>
            <div className="mb-4">
              <h2 className="font-heading text-3xl font-bold leading-none text-keepsake-ink md:text-4xl">
                {activeViewCopy.title}
              </h2>
              <p className="mt-2 text-sm font-semibold text-keepsake-muted md:text-base">
                {activeViewCopy.description}
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-5 text-center shadow-keepsake md:p-8">
                <Film className="mx-auto text-keepsake-roseDeep" size={34} aria-hidden="true" />
                <p className="mt-4 font-heading text-2xl font-bold text-keepsake-ink">
                  {activeViewCopy.emptyTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-keepsake-muted">
                  {activeViewCopy.emptyDescription}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
                {filteredItems.map((item, index) => {
                  const isSelected = selectedIds.has(item.id);

                  return (
                  <button
                    className={[
                      'group relative aspect-square overflow-hidden rounded-xl bg-keepsake-parchment text-left shadow-soft ring-1 ring-keepsake-roseDeep/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-rose/45',
                      isSelected ? 'scale-[0.97] ring-4 ring-keepsake-roseDeep' : '',
                    ].join(' ')}
                    key={item.id}
                    type="button"
                    onClick={() => handleTileClick(item, index)}
                    onPointerCancel={handleTilePointerUp}
                    onPointerDown={(event) => handleTilePointerDown(event, item, index)}
                    onPointerEnter={() => handleTilePointerEnter(item, index)}
                    onPointerLeave={clearLongPressTimer}
                    onPointerUp={handleTilePointerUp}
                  >
                    <img
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                      src={item.src}
                      alt=""
                    />
                    {isMultiSelectMode ? (
                      <span
                        className={[
                          'absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-extrabold shadow-soft',
                          isSelected
                            ? 'border-keepsake-roseDeep bg-keepsake-roseDeep text-white'
                            : 'border-white bg-white/80 text-keepsake-roseDeep',
                        ].join(' ')}
                        aria-hidden="true"
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    ) : null}
                  </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
