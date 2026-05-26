import { LockKeyhole, Mail, UnlockKeyhole } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Keepsake } from '../models/keepsake';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(date),
  );
}

type KeepsakeTimelineItemProps = {
  isRangeSelected?: boolean;
  keepsake: Keepsake;
  onSelectPoint?: () => void;
  selectionMode?: boolean;
};

export function KeepsakeTimelineItem({
  isRangeSelected,
  keepsake,
  onSelectPoint,
  selectionMode,
}: KeepsakeTimelineItemProps) {
  const isLocked = keepsake.status === 'locked';
  const StatusIcon = isLocked ? LockKeyhole : UnlockKeyhole;

  const content = (
    <article
      className={[
        'rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-gradient-to-br from-keepsake-blush via-white/85 to-keepsake-parchment/70 p-5 shadow-keepsake transition',
        isRangeSelected ? 'ring-4 ring-keepsake-gold/70' : 'hover:-translate-y-0.5',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/80 text-keepsake-roseDeep shadow-soft">
          <Mail size={24} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-keepsake-roseDeep">{formatDate(keepsake.createdAt)}</p>
          <h3 className="mt-2 font-heading text-2xl font-bold leading-none text-keepsake-ink">
            {keepsake.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-keepsake-muted">{keepsake.message}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            <StatusIcon size={13} aria-hidden="true" />
            {keepsake.status}
          </p>
        </div>
      </div>
    </article>
  );

  if (selectionMode) {
    return (
      <button className="w-full text-left" type="button" onClick={onSelectPoint}>
        {content}
      </button>
    );
  }

  return <Link to={`/keepsakes/${keepsake.id}`}>{content}</Link>;
}
