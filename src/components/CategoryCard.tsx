import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../data/categories';

const accentClasses = {
  rose: 'from-keepsake-blush via-white/80 to-keepsake-parchment/70 text-keepsake-roseDeep',
  gold: 'from-[#FFF4D9] via-white/80 to-keepsake-parchment/80 text-[#986C2D]',
  sage: 'from-[#EEF4E9] via-white/80 to-keepsake-parchment/70 text-keepsake-sage',
  violet: 'from-[#F4ECFF] via-white/80 to-keepsake-blush/70 text-[#7D5AA3]',
} satisfies Record<Category['accent'], string>;

const iconClasses = {
  rose: 'bg-keepsake-blush text-keepsake-roseDeep',
  gold: 'bg-[#FFF0C8] text-[#986C2D]',
  sage: 'bg-[#EAF2E5] text-keepsake-sage',
  violet: 'bg-[#EFE4FF] text-[#7D5AA3]',
} satisfies Record<Category['accent'], string>;

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <Link
      className={[
        'ks-light-surface group grid min-h-[132px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-keepsake border border-keepsake-roseDeep/10 bg-gradient-to-br p-4 shadow-soft transition duration-200 md:min-h-[168px] md:p-6',
        'active:scale-[0.96] hover:-translate-y-0.5 hover:scale-[1.01] hover:border-keepsake-accent/35 hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-accent/45',
        accentClasses[category.accent],
      ].join(' ')}
      to={category.to}
    >
      <span
        className={[
          'grid h-14 w-14 shrink-0 place-items-center rounded-keepsake shadow-soft',
          iconClasses[category.accent],
        ].join(' ')}
        aria-hidden="true"
      >
        <Icon size={25} strokeWidth={2.15} />
      </span>

      <span className="min-w-0">
        <span className="block font-heading text-[1.55rem] font-bold leading-none text-keepsake-ink md:text-2xl">
          {category.title}
        </span>
        <span className="ks-caption-reveal mt-2 block text-[0.92rem] leading-6 text-keepsake-muted md:text-base">
          {category.description}
        </span>
      </span>

      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/65 text-keepsake-accentStrong transition group-hover:translate-x-0.5">
        <ChevronRight size={20} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </Link>
  );
}
