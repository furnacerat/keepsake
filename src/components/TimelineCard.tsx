import { LockKeyhole, Sparkles, UnlockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Keepsake } from '../models/keepsake';

function formatIdeaType(ideaType: string) {
  return ideaType
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function formatCreatedDate(createdAt: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt));
}

type TimelineCardProps = {
  keepsake: Keepsake;
};

export function TimelineCard({ keepsake }: TimelineCardProps) {
  const isLocked = keepsake.status === 'locked';
  const StatusIcon = isLocked ? LockKeyhole : UnlockKeyhole;

  return (
    <div className="relative pl-8">
      <span className="absolute left-[3px] top-6 grid h-5 w-5 place-items-center rounded-full border-4 border-keepsake-cream bg-keepsake-roseDeep shadow-soft">
        <Sparkles size={10} className="text-white" strokeWidth={2.6} aria-hidden="true" />
      </span>
      <Link
        className="block rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake transition active:scale-[0.985] hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(86,52,47,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-rose/45 md:p-6"
        to={`/keepsakes/${keepsake.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-[1.65rem] font-bold leading-none text-keepsake-ink md:text-2xl">
              {keepsake.title}
            </h3>
            <p className="mt-2 text-sm font-bold text-keepsake-roseDeep">
              {formatIdeaType(keepsake.ideaType)}
            </p>
          </div>
          <span
            className={[
              'inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]',
              isLocked
                ? 'bg-keepsake-blush text-keepsake-roseDeep'
                : 'bg-[#EAF2E5] text-keepsake-sage',
            ].join(' ')}
          >
            <StatusIcon size={13} aria-hidden="true" />
            {keepsake.status}
          </span>
        </div>
        <p className="mt-4 text-sm font-semibold text-keepsake-muted">
          Created {formatCreatedDate(keepsake.createdAt)}
        </p>
      </Link>
    </div>
  );
}
