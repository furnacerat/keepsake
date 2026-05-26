import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Idea } from '../data/ideas';

type IdeaCardProps = {
  idea: Idea;
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const navigate = useNavigate();

  return (
    <article className="ks-card rounded-keepsake p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-glow md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="inline-flex rounded-full bg-keepsake-blush px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
            {idea.tag}
          </span>
          <h2 className="mt-4 font-heading text-[1.75rem] font-bold leading-none text-keepsake-ink md:text-3xl">
            {idea.title}
          </h2>
        </div>
      </div>

      <p className="ks-caption-reveal mt-3 text-[0.95rem] leading-6 text-keepsake-muted md:text-base md:leading-7">{idea.description}</p>

      <button
        className="ks-button-primary mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 text-sm font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-accent/45"
        type="button"
        onClick={() => navigate(`/create?type=${encodeURIComponent(idea.type)}`)}
      >
        Start this keepsake
        <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </article>
  );
}
