import { Heart, MapPin, Star, Tags, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MemoryItem } from '../models/memory';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(date),
  );
}

type PhotoTimelineItemProps = {
  isRangeSelected?: boolean;
  memory: MemoryItem;
  onSelectPoint?: () => void;
  selectionMode?: boolean;
};

export function PhotoTimelineItem({
  isRangeSelected,
  memory,
  onSelectPoint,
  selectionMode,
}: PhotoTimelineItemProps) {
  const content = (
    <article
      className={[
        'overflow-hidden rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-white/80 shadow-keepsake transition',
        isRangeSelected ? 'ring-4 ring-keepsake-gold/70' : 'hover:-translate-y-0.5',
      ].join(' ')}
    >
      <img className="aspect-[4/3] w-full object-cover" src={memory.src} alt="" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-extrabold text-keepsake-roseDeep">{formatDate(memory.createdAt)}</p>
          <div className="flex gap-1 text-keepsake-roseDeep">
            {memory.meaningful ? <Heart size={16} fill="currentColor" aria-label="Meaningful" /> : null}
            {memory.favorite ? <Star size={16} fill="currentColor" aria-label="Favorite" /> : null}
          </div>
        </div>
        {memory.eventTag ? (
          <p className="mt-2 font-heading text-2xl font-bold leading-none text-keepsake-ink">
            {memory.eventTag}
          </p>
        ) : null}
        <div className="mt-3 grid gap-2 text-sm font-semibold text-keepsake-muted">
          {memory.people.length > 0 ? (
            <p className="flex items-center gap-2">
              <UsersRound size={15} aria-hidden="true" />
              {memory.people.slice(0, 3).join(', ')}
            </p>
          ) : null}
          {memory.tags.length > 0 ? (
            <p className="flex items-center gap-2">
              <Tags size={15} aria-hidden="true" />
              {memory.tags.slice(0, 3).join(', ')}
            </p>
          ) : null}
          {memory.location ? (
            <p className="flex items-center gap-2">
              <MapPin size={15} aria-hidden="true" />
              {memory.location}
            </p>
          ) : null}
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

  return <Link to={`/memory-box/${memory.id}`}>{content}</Link>;
}
