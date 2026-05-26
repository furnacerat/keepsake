import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { catalogs } from '../data/ideas';
import type { RecipientType } from '../models/keepsake';
import { createKeepsake } from '../services/keepsakeStorage';

function prettifyType(type: string) {
  return type
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

export function CreateScreen() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? '';
  const hasTemplateSource =
    searchParams.has('photoId') || searchParams.has('photoIds') || searchParams.has('timelineIds');
  const idea = catalogs.flatMap((catalog) => catalog.ideas).find((item) => item.type === type);
  const displayTitle = idea?.title ?? (prettifyType(type) || 'New Keepsake');
  const [recipientType, setRecipientType] = useState<RecipientType>('Myself');
  const [title, setTitle] = useState(displayTitle);
  const [message, setMessage] = useState('');
  const [unlockType, setUnlockType] = useState('None');
  const [unlockDate, setUnlockDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setTitle(displayTitle);
  }, [displayTitle]);

  useEffect(() => {
    if (!showToast) {
      return;
    }

    const timeout = window.setTimeout(() => setShowToast(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [showToast]);

  if (hasTemplateSource) {
    return <Navigate to={`/template-editor?${searchParams.toString()}`} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle) {
      nextErrors.title = 'Add a title for this keepsake.';
    }

    if (!trimmedMessage) {
      nextErrors.message = 'Write a message before creating your keepsake.';
    }

    if (unlockType === 'Unlock on date' && !unlockDate) {
      nextErrors.unlockDate = 'Choose the date this keepsake should unlock.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setShowToast(false);
      return;
    }

    const formData = {
      ideaType: type || 'custom',
      recipientType,
      title: trimmedTitle,
      message: trimmedMessage,
      unlockType: unlockType === 'Unlock on date' ? 'date' : 'none',
      unlockDate: unlockType === 'Unlock on date' ? unlockDate : undefined,
    } as const;

    const keepsake = createKeepsake(formData);

    console.log('Keepsake form submitted', keepsake);
    setShowToast(true);
  }

  return (
    <section className="relative w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Create
        </p>
        <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-keepsake-ink md:text-5xl lg:text-6xl">
          Create your keepsake.
        </h1>
        <p className="mt-5 text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
          Start with a note, choose when it should open, and shape it into something worth returning to.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <form
          className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake backdrop-blur-sm md:p-6"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Recipient type</span>
              <select
                className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                value={recipientType}
                onChange={(event) => setRecipientType(event.target.value as RecipientType)}
              >
                <option>Myself</option>
                <option>Someone Else</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Title</span>
              <input
                className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Name this keepsake"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title ? (
                <span className="text-sm font-semibold text-keepsake-roseDeep" id="title-error">
                  {errors.title}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Message</span>
              <textarea
                className="min-h-40 resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 text-base leading-7 text-keepsake-ink shadow-soft outline-none transition placeholder:text-keepsake-muted/60 focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25 md:min-h-56"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write the words you want this keepsake to hold..."
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message ? (
                <span className="text-sm font-semibold text-keepsake-roseDeep" id="message-error">
                  {errors.message}
                </span>
              ) : null}
            </label>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Unlock type</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                  value={unlockType}
                  onChange={(event) => {
                    setUnlockType(event.target.value);
                    if (event.target.value === 'None') {
                      setUnlockDate('');
                    }
                  }}
                >
                  <option>None</option>
                  <option>Unlock on date</option>
                </select>
              </label>

              {unlockType === 'Unlock on date' ? (
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-keepsake-ink">Unlock date</span>
                  <input
                    className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                    type="date"
                    value={unlockDate}
                    onChange={(event) => setUnlockDate(event.target.value)}
                    aria-invalid={Boolean(errors.unlockDate)}
                    aria-describedby={errors.unlockDate ? 'unlock-date-error' : undefined}
                  />
                  {errors.unlockDate ? (
                    <span className="text-sm font-semibold text-keepsake-roseDeep" id="unlock-date-error">
                      {errors.unlockDate}
                    </span>
                  ) : null}
                </label>
              ) : null}
            </div>
          </div>

          <button
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-keepsake-roseDeep px-4 text-sm font-extrabold text-white shadow-soft transition active:scale-[0.985] hover:bg-keepsake-rose focus:outline-none focus-visible:ring-2 focus-visible:ring-keepsake-rose/45 md:text-base"
            type="submit"
          >
            Create keepsake
          </button>
        </form>

        <aside className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-gradient-to-br from-keepsake-blush via-white/80 to-keepsake-parchment/70 p-5 shadow-keepsake md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            Selected idea
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold leading-none text-keepsake-ink md:text-4xl">
            {displayTitle}
          </h2>
          <p className="mt-5 text-base leading-7 text-keepsake-muted">
            This preview will become the opening note for a keepsake that can be saved now or unlocked later.
          </p>
          <div className="mt-6 rounded-2xl bg-white/65 p-4">
            <p className="text-sm font-bold text-keepsake-roseDeep">Current recipient</p>
            <p className="mt-1 font-heading text-2xl font-bold text-keepsake-ink">{recipientType}</p>
          </div>
        </aside>
      </div>

      {showToast ? (
        <div
          className="fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-keepsake-sage/20 bg-keepsake-ink px-4 py-3 text-white shadow-keepsake"
          role="status"
        >
          <CheckCircle2 className="shrink-0 text-keepsake-sage" size={21} aria-hidden="true" />
          <p className="text-sm font-bold">Keepsake draft created.</p>
        </div>
      ) : null}
    </section>
  );
}
