import { BookHeart, Clock3, Mic, Share2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryCard } from '../components/CategoryCard';
import { categories } from '../data/categories';

const whyCards = [
  {
    icon: BookHeart,
    title: 'Save the Story',
    text: 'Capture the details behind a photo, a family recipe, a milestone, or a moment you still feel.',
  },
  {
    icon: Mic,
    title: 'Preserve the Voice',
    text: 'Make space for audio memories, personality, laughter, and the little phrases people never want to forget.',
  },
  {
    icon: Share2,
    title: 'Share With Family',
    text: 'Create keepsakes that can be revisited, shared, printed, or saved for future generations.',
  },
];

export function HomeScreen() {
  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            Memory preservation
          </p>
          <h1 className="font-heading text-[3.3rem] font-bold leading-[0.9] tracking-normal text-white md:text-6xl lg:text-7xl">
            Turn memories into something future generations can experience.
          </h1>
          <p className="ks-caption-reveal mt-5 text-lg leading-8 text-white/86 md:text-xl md:leading-9">
            Keepsake helps you preserve the voices, stories, photos, and memories you never want to lose.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 md:text-lg md:leading-8">
            Save legacy moments, family stories, meaningful photos, and the small details future generations will wish they could ask about.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-extrabold"
              to="/create?type=first-keepsake"
            >
              <Sparkles size={19} strokeWidth={2.4} aria-hidden="true" />
              Create Your First Keepsake
            </Link>
            <a
              className="ks-hero-secondary-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/90 px-6 py-3 text-base font-extrabold text-keepsake-ink shadow-soft transition active:scale-[0.96] hover:bg-white hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-accent/45"
              href="#how-it-works"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="ks-card overflow-hidden p-5 md:p-6">
          <div className="rounded-[1.25rem] bg-gradient-to-br from-keepsake-cream via-white to-keepsake-blush p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">A keepsake can hold</p>
            <div className="mt-5 grid gap-3">
              {['A story behind an old photo', 'A voice note from someone you love', 'A lesson worth passing down'].map((item) => (
                <div className="rounded-2xl bg-white/78 p-4 shadow-soft" key={item}>
                  <p className="font-heading text-2xl font-bold leading-none text-keepsake-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <Link
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-keepsake-ink px-4 text-sm font-extrabold text-white shadow-soft transition hover:shadow-glow"
            to="/timeline"
          >
            <Clock3 size={17} strokeWidth={2.4} aria-hidden="true" />
            View Timeline
          </Link>
        </div>
      </div>

      <hr className="ks-section-divider" />

      <section className="grid gap-5" id="how-it-works">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            Why it matters
          </p>
          <h2 className="font-heading text-[2.4rem] font-bold leading-none text-white md:text-5xl">
            One day, photos may be all that remain.
          </h2>
          <p className="mt-4 text-base leading-7 text-white/78 md:text-lg md:leading-8">
            Keepsake helps preserve the stories behind them, so a memory can become more than an image in a camera roll.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {whyCards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="ks-card p-5 md:p-6" key={card.title}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-keepsake-blush text-keepsake-roseDeep shadow-soft">
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-3xl font-bold leading-none text-keepsake-ink">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-keepsake-muted md:text-base md:leading-7">{card.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ks-card p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Start simply</p>
            <h2 className="mt-2 font-heading text-3xl font-bold leading-none text-keepsake-ink md:text-4xl">
              Choose a memory type, answer a few prompts, and save the first version.
            </h2>
          </div>
          <Link
            className="ks-button-primary inline-flex min-h-12 shrink-0 items-center justify-center rounded-full px-5 text-sm font-extrabold"
            to="/create?type=first-keepsake"
          >
            Create a Keepsake
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" aria-label="Keepsake categories">
        {categories.map((category) => (
          <CategoryCard category={category} key={category.to} />
        ))}
      </div>
    </section>
  );
}
