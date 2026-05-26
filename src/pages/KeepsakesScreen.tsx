import { CalendarClock, LockKeyhole, UnlockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getKeepsakes } from '../services/keepsakeStorage';

function formatUnlockInfo(unlockType: string, unlockDate?: string) {
  if (unlockType === 'date' && unlockDate) {
    return `Unlocks on ${unlockDate}`;
  }

  return 'Available now';
}

export function KeepsakesScreen() {
  const keepsakes = getKeepsakes();

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Library
        </p>
        <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-keepsake-ink md:text-5xl lg:text-6xl">
          My Keepsakes
        </h1>
        <p className="mt-5 text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
          All the letters, capsules, and small memories you have saved so far.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white/88 px-5 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
          to="/memory-map"
        >
          Search the Memory Map
        </Link>
      </div>

      {keepsakes.length === 0 ? (
        <div className="max-w-2xl rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-5 shadow-keepsake md:p-6">
          <p className="font-heading text-2xl font-bold text-keepsake-ink">Nothing saved yet.</p>
          <p className="mt-2 text-sm leading-6 text-keepsake-muted">
            Start from a catalog idea and your keepsake will appear here.
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-keepsake-roseDeep px-4 text-sm font-extrabold text-white shadow-soft"
            to="/"
          >
            Browse ideas
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3" aria-label="Saved keepsakes">
          {keepsakes.map((keepsake) => {
            const isLocked = keepsake.status === 'locked';
            const StatusIcon = isLocked ? LockKeyhole : UnlockKeyhole;

            return (
              <Link
                className="rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/75 p-4 shadow-keepsake transition active:scale-[0.985] hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(86,52,47,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-rose/45 md:p-6"
                key={keepsake.id}
                to={`/keepsakes/${keepsake.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-[1.7rem] font-bold leading-none text-keepsake-ink md:text-2xl">
                    {keepsake.title}
                  </h2>
                  <span
                    className={[
                      'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em]',
                      isLocked
                        ? 'bg-keepsake-blush text-keepsake-roseDeep'
                        : 'bg-[#EAF2E5] text-keepsake-sage',
                    ].join(' ')}
                  >
                    <StatusIcon size={13} aria-hidden="true" />
                    {keepsake.status}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-keepsake-muted">
                  <CalendarClock size={16} aria-hidden="true" />
                  {formatUnlockInfo(keepsake.unlockType, keepsake.unlockDate)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
