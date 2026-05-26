import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { suggestRelatedKeepsakes } from '../services/MemoryGraphEngine';

type RelatedKeepsakesPanelProps = {
  keepsakeId: string;
};

export function RelatedKeepsakesPanel({ keepsakeId }: RelatedKeepsakesPanelProps) {
  const relatedKeepsakes = suggestRelatedKeepsakes(keepsakeId);

  return (
    <aside className="ks-card p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-keepsake-blush text-keepsake-roseDeep">
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
            Memory Graph
          </p>
          <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Related memories</h2>
        </div>
      </div>

      {relatedKeepsakes.length ? (
        <div className="mt-5 grid gap-3">
          {relatedKeepsakes.map(({ keepsake, score }) => (
            <Link
              className="rounded-2xl bg-keepsake-cream p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
              key={keepsake.id}
              to={`/keepsakes/${keepsake.id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-2xl font-bold leading-none text-keepsake-ink">{keepsake.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-keepsake-muted">{keepsake.message}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-keepsake-accentStrong">
                  {Math.round(score * 100)}%
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-keepsake-muted">
          Related keepsakes will appear here as people, places, events, and time periods connect.
        </p>
      )}
    </aside>
  );
}
