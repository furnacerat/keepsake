import { CalendarClock, LockKeyhole, Plus, Search, Sparkles, UnlockKeyhole, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Keepsake } from '../models/keepsake';
import { getKeepsakes } from '../services/keepsakeStorage';

function formatUnlockInfo(unlockType: string, unlockDate?: string) {
  if (unlockType === 'date' && unlockDate) {
    return `Unlocks on ${unlockDate}`;
  }

  return 'Available now';
}

function getMemoryDate(keepsake: Keepsake) {
  return keepsake.memoryDate ?? keepsake.approximateTimePeriod ?? new Date(keepsake.createdAt).toLocaleDateString();
}

function getPreview(message: string) {
  return message.length > 135 ? `${message.slice(0, 132)}...` : message;
}

export function KeepsakesScreen() {
  const keepsakes = getKeepsakes();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const typeOptions = useMemo(
    () => Array.from(new Set(keepsakes.map((keepsake) => keepsake.memoryType ?? keepsake.ideaType).filter(Boolean))),
    [keepsakes],
  );
  const rediscoveredKeepsake = useMemo(() => {
    if (!keepsakes.length) return undefined;
    const index = new Date().getDay() % keepsakes.length;
    return keepsakes[index];
  }, [keepsakes]);
  const filteredKeepsakes = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return keepsakes.filter((keepsake) => {
      const searchable = [
        keepsake.title,
        keepsake.memoryType,
        keepsake.ideaType,
        keepsake.person,
        keepsake.memoryDate,
        keepsake.approximateTimePeriod,
        keepsake.message,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (typeFilter !== 'all' && (keepsake.memoryType ?? keepsake.ideaType) !== typeFilter) return false;
      return !normalizedQuery || searchable.includes(normalizedQuery);
    });
  }, [keepsakes, query, typeFilter]);

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            Keepsake Dashboard
          </p>
          <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-white md:text-5xl lg:text-6xl">
            Welcome back to your memory library.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/78 md:text-xl md:leading-8">
            Search, rediscover, and continue building the stories you never want to lose.
          </p>
        </div>
        <Link
          className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold"
          to="/create?type=first-keepsake"
        >
          <Plus size={18} aria-hidden="true" />
          Create New Keepsake
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="ks-card grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_220px] md:p-5">
          <label className="relative grid gap-2">
            <span className="ks-form-label text-sm font-bold">Search by person, type, date, or story</span>
            <Search className="pointer-events-none absolute bottom-3 left-4 text-keepsake-muted" size={18} aria-hidden="true" />
            <input
              className="min-h-12 w-full rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream pl-11 pr-4 text-base font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Grandma, voice, summer 2019..."
            />
          </label>
          <label className="grid gap-2">
            <span className="ks-form-label text-sm font-bold">Type</span>
            <select
              className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All types</option>
              {typeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <aside className="ks-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-keepsake-blush text-keepsake-roseDeep shadow-soft">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Memory of the Week</p>
              <h2 className="font-heading text-3xl font-bold leading-none text-keepsake-ink">Rediscover a Keepsake</h2>
            </div>
          </div>
          {rediscoveredKeepsake ? (
            <Link className="mt-5 block rounded-2xl bg-keepsake-cream p-4 shadow-soft transition hover:shadow-glow" to={`/keepsakes/${rediscoveredKeepsake.id}`}>
              <p className="font-heading text-2xl font-bold leading-none text-keepsake-ink">{rediscoveredKeepsake.title}</p>
              <p className="mt-2 text-sm font-semibold text-keepsake-muted">
                {rediscoveredKeepsake.person ? `${rediscoveredKeepsake.person} - ` : ''}
                {getMemoryDate(rediscoveredKeepsake)}
              </p>
            </Link>
          ) : (
            <p className="mt-4 text-sm leading-6 text-keepsake-muted">
              Create your first keepsake, and this space will begin bringing meaningful memories back to you.
            </p>
          )}
        </aside>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/88 px-5 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
          to="/memory-map"
        >
          Search the Memory Map
        </Link>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-white/88 px-5 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
          to="/timeline"
        >
          View Timeline
        </Link>
      </div>

      {keepsakes.length === 0 ? (
        <div className="ks-card max-w-2xl p-5 md:p-6">
          <p className="font-heading text-3xl font-bold text-keepsake-ink">Your memory library is waiting.</p>
          <p className="mt-2 text-base leading-7 text-keepsake-muted">
            Start with one photo, one voice, or one story. The first keepsake does not need to be perfect; it just needs to begin.
          </p>
          <Link
            className="ks-button-primary mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full px-4 text-sm font-extrabold"
            to="/create?type=first-keepsake"
          >
            Create Your First Keepsake
          </Link>
        </div>
      ) : filteredKeepsakes.length === 0 ? (
        <div className="ks-card p-6">
          <p className="font-heading text-3xl font-bold text-keepsake-ink">No matching memories.</p>
          <p className="mt-2 text-sm leading-6 text-keepsake-muted">Try searching a different person, memory type, or date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3" aria-label="Saved keepsakes">
          {filteredKeepsakes.map((keepsake) => {
            const isLocked = keepsake.status === 'locked';
            const StatusIcon = isLocked ? LockKeyhole : UnlockKeyhole;

            return (
              <article className="ks-card p-4 transition active:scale-[0.985] hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(86,52,47,0.16)] md:p-6" key={keepsake.id}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-[1.7rem] font-bold leading-none text-keepsake-ink md:text-2xl">
                    {keepsake.title}
                  </h2>
                  <span
                    className={[
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em]',
                      isLocked ? 'bg-keepsake-blush text-keepsake-roseDeep' : 'bg-[#EAF2E5] text-keepsake-sage',
                    ].join(' ')}
                  >
                    <StatusIcon size={13} aria-hidden="true" />
                    {keepsake.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-keepsake-muted">
                  <p className="inline-flex items-center gap-2">
                    <UserRound size={16} aria-hidden="true" />
                    {keepsake.person || 'Someone meaningful'}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CalendarClock size={16} aria-hidden="true" />
                    {getMemoryDate(keepsake)}
                  </p>
                </div>
                <p className="mt-3 rounded-2xl bg-keepsake-cream p-3 text-sm leading-6 text-keepsake-muted">
                  {getPreview(keepsake.message)}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-keepsake-blush px-3 py-1 text-xs font-extrabold text-keepsake-roseDeep">
                    {keepsake.memoryType ?? keepsake.ideaType}
                  </span>
                  <Link
                    className="rounded-full bg-keepsake-ink px-4 py-2 text-sm font-extrabold text-white shadow-soft transition hover:shadow-glow"
                    to={`/keepsakes/${keepsake.id}`}
                  >
                    View
                  </Link>
                </div>
                <p className="mt-3 text-xs font-bold text-keepsake-muted">{formatUnlockInfo(keepsake.unlockType, keepsake.unlockDate)}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
