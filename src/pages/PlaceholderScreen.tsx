type PlaceholderScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderScreen({ eyebrow, title, description }: PlaceholderScreenProps) {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 md:space-y-10">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
        {eyebrow}
      </p>
      <h1 className="font-heading text-[3.2rem] font-bold leading-[0.92] tracking-normal text-keepsake-ink md:text-[4rem]">
        {title}
      </h1>
      <p className="mt-5 text-base leading-7 text-keepsake-muted md:text-lg">{description}</p>

      <div className="mt-8 rounded-keepsake border border-keepsake-roseDeep/10 bg-white/70 p-5 shadow-keepsake">
        <p className="text-sm font-semibold text-keepsake-roseDeep">Placeholder screen</p>
        <p className="mt-2 text-sm leading-6 text-keepsake-muted">
          Navigation is wired and ready for the Phase 2 catalog experience.
        </p>
      </div>
    </section>
  );
}
