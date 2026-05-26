import { Archive, CalendarPlus, ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Dropdown } from '../components/Dropdown';
import { TagInput } from '../components/TagInput';
import { ToggleSwitch } from '../components/ToggleSwitch';
import type { MemoryItem } from '../models/memory';
import { getMemoryItem, updateMemoryItem } from '../services/memoryStorage';

const eventTagOptions = [
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

function formatDate(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt));
}

export function PhotoDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialItem = id ? getMemoryItem(id) : undefined;
  const [item, setItem] = useState<MemoryItem | undefined>(initialItem);
  const [memoryDate, setMemoryDate] = useState(initialItem?.createdAt.slice(0, 10) ?? '');
  const [location, setLocation] = useState(initialItem?.location ?? '');
  const [notes, setNotes] = useState(initialItem?.notes ?? '');
  const [eventTag, setEventTag] = useState(
    initialItem?.eventTag && !eventTagOptions.includes(initialItem.eventTag)
      ? 'Custom'
      : initialItem?.eventTag ?? '',
  );
  const [customEventTag, setCustomEventTag] = useState(
    initialItem?.eventTag && !eventTagOptions.includes(initialItem.eventTag)
      ? initialItem.eventTag
      : '',
  );

  if (!item) {
    return <Navigate to="/memory-box" replace />;
  }

  const currentItem = item;

  function saveItem(input: Partial<MemoryItem>) {
    const updated = updateMemoryItem(currentItem.id, input);
    if (updated) {
      setItem(updated);
      setLocation(updated.location ?? '');
      setNotes(updated.notes);
      setMemoryDate(updated.createdAt.slice(0, 10));
      if (updated.eventTag && !eventTagOptions.includes(updated.eventTag)) {
        setEventTag('Custom');
        setCustomEventTag(updated.eventTag);
      } else {
        setEventTag(updated.eventTag ?? '');
        setCustomEventTag('');
      }
    }
  }

  function saveMemoryDate(date: string) {
    if (!date) {
      return;
    }

    saveItem({ createdAt: new Date(`${date}T12:00:00`).toISOString() });
  }

  function saveEventTag(nextEventTag: string, nextCustomEventTag = customEventTag) {
    setEventTag(nextEventTag);

    if (nextEventTag === 'Custom') {
      saveItem({ eventTag: nextCustomEventTag.trim() });
      return;
    }

    setCustomEventTag('');
    saveItem({ eventTag: nextEventTag });
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <Link className="text-sm font-bold text-keepsake-roseDeep" to="/memory-box">
        Memory Box
      </Link>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="overflow-hidden rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/75 p-3 shadow-keepsake md:p-4">
          <img className="max-h-[72vh] w-full rounded-[1.15rem] object-contain" src={item.src} alt="" loading="lazy" decoding="async" />
        </div>

        <aside className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-5 shadow-keepsake md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            Photo Details
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold leading-none text-keepsake-ink md:text-4xl">
            Private memory
          </h1>
          <p className="mt-3 text-sm font-semibold text-keepsake-muted">
            Added {formatDate(item.createdAt)}
          </p>

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Date</span>
              <input
                className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                type="date"
                value={memoryDate}
                onBlur={() => saveMemoryDate(memoryDate)}
                onChange={(event) => setMemoryDate(event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Location</span>
              <input
                className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                value={location}
                onBlur={() => saveItem({ location: location.trim() })}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Add a place"
              />
            </label>

            <Dropdown
              label="Event Tag"
              options={eventTagOptions}
              value={eventTag}
              onChange={(nextEventTag) => saveEventTag(nextEventTag)}
            />

            {eventTag === 'Custom' ? (
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Custom Event</span>
                <input
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                  value={customEventTag}
                  onBlur={() => saveItem({ eventTag: customEventTag.trim() })}
                  onChange={(event) => {
                    setCustomEventTag(event.target.value);
                  }}
                  placeholder="Name the event"
                />
              </label>
            ) : null}

            <TagInput
              label="People"
              placeholder="Mom, Alex..."
              values={item.people}
              onChange={(people) => saveItem({ people })}
            />

            <TagInput
              label="Tags"
              placeholder="holiday, childhood..."
              values={item.tags}
              onChange={(tags) => saveItem({ tags })}
            />

            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Notes</span>
              <textarea
                className="min-h-28 resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 text-base leading-7 text-keepsake-ink shadow-soft outline-none transition placeholder:text-keepsake-muted/60 focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                value={notes}
                onBlur={() => saveItem({ notes: notes.trim() })}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="What makes this photo matter?"
              />
            </label>

            <div className="grid gap-3">
              <ToggleSwitch
                checked={item.meaningful}
                label="Meaningful"
                description="Mark this as a moment with emotional weight."
                onChange={(meaningful) => saveItem({ meaningful })}
              />
              <ToggleSwitch
                checked={item.favorite}
                label="Favorite"
                description="Keep this photo close at hand."
                onChange={(favorite) => saveItem({ favorite })}
              />
            </div>
          </div>

          <div className="mt-7 grid gap-3">
            <button
              className={[
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold shadow-soft transition',
                item.isFiled
                  ? 'bg-keepsake-blush text-keepsake-roseDeep'
                  : 'bg-keepsake-roseDeep text-white hover:bg-keepsake-rose',
              ].join(' ')}
              type="button"
              onClick={() => saveItem({ isFiled: true, isOnTimeline: false })}
            >
              <Archive size={17} aria-hidden="true" />
              {item.isFiled ? 'In Filing Drawer' : 'Add to Filing Drawer'}
            </button>
            <button
              className={[
                'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold shadow-soft transition',
                item.isOnTimeline
                  ? 'bg-[#EAF2E5] text-keepsake-sage'
                  : 'bg-keepsake-ink text-white hover:bg-keepsake-roseDeep',
              ].join(' ')}
              type="button"
              onClick={() => saveItem({ isFiled: false, isOnTimeline: true })}
            >
              <CalendarPlus size={17} aria-hidden="true" />
              {item.isOnTimeline ? 'On Timeline' : 'Add to Timeline'}
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold text-keepsake-roseDeep shadow-soft transition hover:bg-keepsake-blush"
              type="button"
              onClick={() => navigate(`/create?type=photo-memory&photoId=${item.id}`)}
            >
              <ImagePlus size={17} aria-hidden="true" />
              Create Keepsake from this Photo
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
