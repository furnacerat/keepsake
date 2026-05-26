import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const benefits = [
  'Premium templates and animated keepsakes',
  'Pages Come To Life QR playback',
  'High-resolution exports',
  'Future scrapbook and album print upgrades',
];

export function PaywallScreen() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 md:space-y-10">
      <div className="ks-card p-6 text-center md:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-keepsake-blush text-keepsake-accentStrong shadow-soft">
          <Sparkles size={25} aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
          Keepsake Pro
        </p>
        <h1 className="mt-3 font-heading text-[3rem] font-bold leading-[0.94] text-keepsake-ink md:text-6xl">
          Unlock the full memory studio.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-keepsake-muted md:text-lg">
          This is a placeholder paywall for future billing integration. Stripe checkout will plug into this flow later.
        </p>

        <div className="mx-auto mt-7 max-w-md rounded-keepsake bg-keepsake-cream p-5 text-left shadow-soft">
          <p className="font-heading text-3xl font-bold text-keepsake-ink">$8/month</p>
          <p className="mt-1 text-sm font-semibold text-keepsake-muted">Placeholder price, not active billing.</p>
          <div className="mt-5 grid gap-3">
            {benefits.map((benefit) => (
              <p className="flex items-start gap-3 text-sm font-bold text-keepsake-ink" key={benefit}>
                <Check className="mt-0.5 shrink-0 text-keepsake-accentStrong" size={17} aria-hidden="true" />
                {benefit}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            className="ks-button-primary inline-flex min-h-12 items-center justify-center px-6 text-sm font-extrabold"
            type="button"
            onClick={() => {
              console.log('Paywall checkout placeholder clicked');
            }}
          >
            Continue to checkout
          </button>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
            to="/"
          >
            Maybe later
          </Link>
        </div>
      </div>
    </section>
  );
}
