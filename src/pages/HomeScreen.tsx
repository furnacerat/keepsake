import { Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryCard } from '../components/CategoryCard';
import { categories } from '../data/categories';

export function HomeScreen() {
  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
          Memory boutique
        </p>
        <h1 className="font-heading text-[3.15rem] font-bold leading-[0.92] tracking-normal text-keepsake-ink md:text-6xl lg:text-7xl">
          What kind of memory do you want to create today
        </h1>
        <p className="ks-caption-reveal mt-5 text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
          Begin with a feeling, a person, or a moment. Keepsake will hold the rest gently.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/75 px-4 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition active:scale-[0.96] hover:bg-keepsake-blush hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-accent/45 md:text-base"
          to="/timeline"
        >
          <Clock3 size={17} strokeWidth={2.4} aria-hidden="true" />
          View Timeline
        </Link>
      </div>

      <hr className="ks-section-divider" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" aria-label="Keepsake categories">
        {categories.map((category) => (
          <CategoryCard category={category} key={category.to} />
        ))}
      </div>
    </section>
  );
}
