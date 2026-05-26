import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Camera, CheckCircle2, Mic, PenLine, UsersRound } from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { catalogs } from '../data/ideas';
import type { MemoryType, RecipientType } from '../models/keepsake';
import { createKeepsake, getKeepsake, updateKeepsake } from '../services/keepsakeStorage';

const memoryTypes: Array<{ description: string; icon: typeof Camera; label: MemoryType }> = [
  {
    icon: Camera,
    label: 'Photo Memory',
    description: 'Start with an image and preserve the story behind it.',
  },
  {
    icon: Mic,
    label: 'Voice Memory',
    description: 'Save the feeling of a voice, laugh, phrase, or audio note.',
  },
  {
    icon: PenLine,
    label: 'Written Story',
    description: 'Write a memory, lesson, letter, or moment in your own words.',
  },
  {
    icon: UsersRound,
    label: 'Family Legacy',
    description: 'Capture a story future generations should know.',
  },
];

const memoryPrompts = [
  'What is something you never want to forget about this person?',
  'What did their voice, laugh, or personality feel like?',
  'What is one story future generations should know?',
  'What lesson did this memory teach you?',
  'What small detail makes this memory special?',
];

function prettifyType(type: string) {
  return type
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function getInitialMemoryType(type: string): MemoryType {
  const normalized = prettifyType(type).toLowerCase();
  if (normalized.includes('voice') || normalized.includes('audio')) return 'Voice Memory';
  if (normalized.includes('photo')) return 'Photo Memory';
  if (normalized.includes('family') || normalized.includes('legacy')) return 'Family Legacy';
  return 'Written Story';
}

export function CreateScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') ?? '';
  const editId = searchParams.get('edit');
  const hasTemplateSource =
    searchParams.has('photoId') || searchParams.has('photoIds') || searchParams.has('timelineIds');
  const idea = catalogs.flatMap((catalog) => catalog.ideas).find((item) => item.type === type);
  const editingKeepsake = editId ? getKeepsake(editId) : undefined;
  const displayTitle = editingKeepsake?.title ?? idea?.title ?? (prettifyType(type) || 'New Keepsake');
  const [recipientType, setRecipientType] = useState<RecipientType>(editingKeepsake?.recipientType ?? 'Myself');
  const [memoryType, setMemoryType] = useState<MemoryType>(editingKeepsake?.memoryType ?? getInitialMemoryType(type));
  const [title, setTitle] = useState(displayTitle);
  const [person, setPerson] = useState(editingKeepsake?.person ?? '');
  const [memoryDate, setMemoryDate] = useState(editingKeepsake?.memoryDate ?? '');
  const [approximateTimePeriod, setApproximateTimePeriod] = useState(editingKeepsake?.approximateTimePeriod ?? '');
  const [message, setMessage] = useState(editingKeepsake?.message ?? '');
  const [photoFileName, setPhotoFileName] = useState(editingKeepsake?.photoPlaceholder ? 'Photo selected' : '');
  const [voiceFileName, setVoiceFileName] = useState(editingKeepsake?.voicePlaceholder ? 'Voice note selected' : '');
  const [unlockType, setUnlockType] = useState(editingKeepsake?.unlockType === 'date' ? 'Unlock on date' : 'None');
  const [unlockDate, setUnlockDate] = useState(editingKeepsake?.unlockDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  const selectedType = useMemo(
    () => memoryTypes.find((item) => item.label === memoryType) ?? memoryTypes[2],
    [memoryType],
  );

  useEffect(() => {
    if (!editingKeepsake) {
      setTitle(displayTitle);
      setMemoryType(getInitialMemoryType(type));
    }
  }, [displayTitle, editingKeepsake, type]);

  useEffect(() => {
    if (!showToast) return;

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
    const trimmedPerson = person.trim();

    if (!trimmedTitle) nextErrors.title = 'Add a title for this keepsake.';
    if (!trimmedPerson) nextErrors.person = 'Add the person connected to this memory.';
    if (!memoryDate && !approximateTimePeriod.trim()) {
      nextErrors.time = 'Add a date or approximate time period.';
    }
    if (!trimmedMessage) nextErrors.message = 'Write the memory before saving your keepsake.';
    if (unlockType === 'Unlock on date' && !unlockDate) {
      nextErrors.unlockDate = 'Choose the date this keepsake should unlock.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShowToast(false);
      return;
    }

    const input = {
      ideaType: type || memoryType,
      recipientType,
      title: trimmedTitle,
      message: trimmedMessage,
      unlockType: unlockType === 'Unlock on date' ? 'date' : 'none',
      unlockDate: unlockType === 'Unlock on date' ? unlockDate : undefined,
      memoryType,
      person: trimmedPerson,
      memoryDate: memoryDate || undefined,
      approximateTimePeriod: approximateTimePeriod.trim() || undefined,
      photoPlaceholder: Boolean(photoFileName),
      voicePlaceholder: Boolean(voiceFileName),
    } as const;

    const keepsake = editingKeepsake ? updateKeepsake(editingKeepsake.id, input) : createKeepsake(input);
    setShowToast(true);

    window.setTimeout(() => {
      if (keepsake) navigate(`/keepsakes/${keepsake.id}`);
    }, 550);
  }

  return (
    <section className="relative w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
          {editingKeepsake ? 'Edit Keepsake' : 'Create Your First Keepsake'}
        </p>
        <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-white md:text-5xl lg:text-6xl">
          Begin with one memory worth keeping.
        </h1>
        <p className="mt-5 text-base leading-7 text-white/78 md:text-xl md:leading-8">
          Choose a memory type, add the person and time, then write the story future-you or your family will want to find again.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.85fr)]">
        <form className="ks-card p-4 md:p-6" onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <fieldset className="grid gap-3">
              <legend className="ks-form-label text-sm font-bold">Choose a memory type</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {memoryTypes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = memoryType === item.label;

                  return (
                    <button
                      className={[
                        'rounded-[1.15rem] border p-4 text-left shadow-soft transition active:scale-[0.98]',
                        isSelected
                          ? 'border-keepsake-accent bg-keepsake-cream ring-2 ring-keepsake-accent/30'
                          : 'border-keepsake-roseDeep/10 bg-white/70 hover:bg-keepsake-blush/50',
                      ].join(' ')}
                      key={item.label}
                      type="button"
                      onClick={() => setMemoryType(item.label)}
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-keepsake-blush text-keepsake-roseDeep">
                        <Icon size={21} aria-hidden="true" />
                      </span>
                      <span className="mt-3 block font-heading text-2xl font-bold leading-none text-keepsake-ink">
                        {item.label}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-keepsake-muted">{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="ks-form-label text-sm font-bold">Title</span>
                <input
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Grandma's kitchen on Sunday"
                  aria-invalid={Boolean(errors.title)}
                />
                {errors.title ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.title}</span> : null}
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Person connected to this memory</span>
                  <input
                    className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                    value={person}
                    onChange={(event) => setPerson(event.target.value)}
                    placeholder="Mom, Grandpa, Emma..."
                    aria-invalid={Boolean(errors.person)}
                  />
                  {errors.person ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.person}</span> : null}
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Recipient type</span>
                  <select
                    className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                    value={recipientType}
                    onChange={(event) => setRecipientType(event.target.value as RecipientType)}
                  >
                    <option>Myself</option>
                    <option>Someone Else</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Date</span>
                  <input
                    className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                    type="date"
                    value={memoryDate}
                    onChange={(event) => setMemoryDate(event.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Or approximate time period</span>
                  <input
                    className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                    value={approximateTimePeriod}
                    onChange={(event) => setApproximateTimePeriod(event.target.value)}
                    placeholder="Summer 2019, childhood, first year..."
                    aria-invalid={Boolean(errors.time)}
                  />
                </label>
              </div>
              {errors.time ? <span className="-mt-3 text-sm font-semibold text-keepsake-roseDeep">{errors.time}</span> : null}

              <label className="grid gap-2">
                <span className="ks-form-label text-sm font-bold">Story / memory text</span>
                <textarea
                  className="min-h-52 resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 text-base leading-7 text-keepsake-ink shadow-soft outline-none transition placeholder:text-keepsake-muted/60 focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25 md:min-h-60"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write what happened, what it felt like, and the small details you never want to lose..."
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.message}</span> : null}
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid cursor-pointer gap-2 rounded-2xl border border-dashed border-keepsake-roseDeep/25 bg-keepsake-blush/45 p-4">
                  <span className="inline-flex items-center gap-2 text-sm font-extrabold text-keepsake-roseDeep">
                    <Camera size={17} aria-hidden="true" />
                    Optional photo upload
                  </span>
                  <span className="text-sm font-semibold text-keepsake-muted">{photoFileName || 'Placeholder for now'}</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setPhotoFileName(event.target.files?.[0]?.name ?? '')}
                  />
                </label>
                <label className="grid cursor-pointer gap-2 rounded-2xl border border-dashed border-keepsake-roseDeep/25 bg-keepsake-sageSoft/70 p-4">
                  <span className="inline-flex items-center gap-2 text-sm font-extrabold text-keepsake-roseDeep">
                    <Mic size={17} aria-hidden="true" />
                    Optional voice upload
                  </span>
                  <span className="text-sm font-semibold text-keepsake-muted">{voiceFileName || 'Placeholder for now'}</span>
                  <input
                    className="sr-only"
                    type="file"
                    accept="audio/*"
                    onChange={(event) => setVoiceFileName(event.target.files?.[0]?.name ?? '')}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Unlock type</span>
                  <select
                    className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                    value={unlockType}
                    onChange={(event) => {
                      setUnlockType(event.target.value);
                      if (event.target.value === 'None') setUnlockDate('');
                    }}
                  >
                    <option>None</option>
                    <option>Unlock on date</option>
                  </select>
                </label>

                {unlockType === 'Unlock on date' ? (
                  <label className="grid gap-2">
                    <span className="ks-form-label text-sm font-bold">Unlock date</span>
                    <input
                      className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none transition focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                      type="date"
                      value={unlockDate}
                      onChange={(event) => setUnlockDate(event.target.value)}
                      aria-invalid={Boolean(errors.unlockDate)}
                    />
                    {errors.unlockDate ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.unlockDate}</span> : null}
                  </label>
                ) : null}
              </div>
            </div>
          </div>

          <button
            className="ks-button-primary mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full px-4 py-3 text-base font-extrabold"
            type="submit"
          >
            {editingKeepsake ? 'Save Changes' : 'Save Keepsake'}
          </button>
        </form>

        <aside className="space-y-4">
          <div className="ks-card p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
              Guided prompts
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold leading-none text-keepsake-ink">
              Not sure what to write?
            </h2>
            <div className="mt-5 grid gap-3">
              {memoryPrompts.map((prompt) => (
                <button
                  className="rounded-2xl bg-keepsake-cream p-4 text-left text-sm font-bold leading-6 text-keepsake-ink shadow-soft transition hover:shadow-glow"
                  key={prompt}
                  type="button"
                  onClick={() => setMessage((current) => (current ? `${current}\n\n${prompt}\n` : `${prompt}\n`))}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="ks-card p-5 md:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Selected type</p>
            <h2 className="mt-2 font-heading text-3xl font-bold leading-none text-keepsake-ink">{selectedType.label}</h2>
            <p className="mt-4 text-base leading-7 text-keepsake-muted">{selectedType.description}</p>
          </div>
        </aside>
      </div>

      {showToast ? (
        <div
          className="fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-keepsake-sage/20 bg-keepsake-ink px-4 py-3 text-white shadow-keepsake"
          role="status"
        >
          <CheckCircle2 className="shrink-0 text-keepsake-sage" size={21} aria-hidden="true" />
          <p className="text-sm font-bold">Keepsake saved.</p>
        </div>
      ) : null}
    </section>
  );
}
