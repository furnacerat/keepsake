import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  Feather,
  FilePenLine,
  Gift,
  Heart,
  Home,
  LockKeyhole,
  Mic,
  PenLine,
  Sparkles,
  UsersRound,
  Video,
} from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { catalogs } from '../data/ideas';
import type { EmotionalIntent, KeepsakeVisibility, MemoryMood, MemoryType, RecipientType } from '../models/keepsake';
import { createKeepsake, getKeepsake, updateKeepsake } from '../services/keepsakeStorage';

type WizardStep = 'intent' | 'reflection' | 'media' | 'preview';

const emotionalIntents: Array<{
  description: string;
  icon: typeof Heart;
  intent: EmotionalIntent;
  supportive: string;
}> = [
  {
    icon: Heart,
    intent: 'Preserve a Person',
    description: 'Hold onto the details of someone who shaped you.',
    supportive: 'This memory matters.',
  },
  {
    icon: Camera,
    intent: 'Preserve a Moment',
    description: 'Save the atmosphere, place, and feeling of a day.',
    supportive: 'Some moments deserve to last.',
  },
  {
    icon: Gift,
    intent: 'Leave Something for the Future',
    description: 'Create words or media for someone to discover later.',
    supportive: 'Future you will thank you.',
  },
  {
    icon: PenLine,
    intent: 'Tell My Story',
    description: 'Reflect on the chapters, lessons, and becoming of your life.',
    supportive: 'Your story has weight.',
  },
  {
    icon: Home,
    intent: 'Save a Family Memory',
    description: 'Gather a story that belongs to more than one person.',
    supportive: 'Family history begins in small details.',
  },
  {
    icon: LockKeyhole,
    intent: 'Create an Unlockable Message',
    description: 'Write something that opens at the right time.',
    supportive: 'Waiting can make a message sacred.',
  },
];

const memoryTypes: Array<{ description: string; icon: typeof Camera; label: MemoryType }> = [
  { icon: Camera, label: 'Photo Memory', description: 'A photo with the story that gives it meaning.' },
  { icon: Mic, label: 'Voice Memory', description: 'A voice, laugh, phrase, or sound you never want to lose.' },
  { icon: PenLine, label: 'Written Story', description: 'A memory, lesson, letter, or reflection in your own words.' },
  { icon: UsersRound, label: 'Family Legacy', description: 'A story future generations should be able to find.' },
];

const reflectionPrompts = [
  'What moment do you never want to forget?',
  'What would future generations want to know?',
  'What did this person sound like?',
  'What small detail still makes you smile?',
  'What lesson should live on?',
];

const moodOptions: MemoryMood[] = ['Tender', 'Joyful', 'Grateful', 'Nostalgic', 'Hopeful', 'Reflective'];

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

function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function joinAnswers(answers: string[]) {
  return answers.map((answer) => answer.trim()).filter(Boolean).join('\n\n');
}

function getTimeLabel(memoryDate: string, approximateTimePeriod: string) {
  return memoryDate || approximateTimePeriod.trim() || 'A time worth remembering';
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

  const [step, setStep] = useState<WizardStep>(editingKeepsake ? 'reflection' : 'intent');
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [recipientType, setRecipientType] = useState<RecipientType>(editingKeepsake?.recipientType ?? 'Myself');
  const [memoryType, setMemoryType] = useState<MemoryType>(editingKeepsake?.memoryType ?? getInitialMemoryType(type));
  const [emotionalIntent, setEmotionalIntent] = useState<EmotionalIntent>(editingKeepsake?.emotionalIntent ?? 'Preserve a Person');
  const [title, setTitle] = useState(displayTitle);
  const [person, setPerson] = useState(editingKeepsake?.person ?? '');
  const [memoryDate, setMemoryDate] = useState(editingKeepsake?.memoryDate ?? '');
  const [approximateTimePeriod, setApproximateTimePeriod] = useState(editingKeepsake?.approximateTimePeriod ?? '');
  const [answers, setAnswers] = useState<string[]>(() => {
    if (!editingKeepsake?.message) return reflectionPrompts.map(() => '');
    const pieces = editingKeepsake.message.split(/\n{2,}/);
    return reflectionPrompts.map((_, index) => pieces[index] ?? '');
  });
  const [photoFileName, setPhotoFileName] = useState(editingKeepsake?.photoPlaceholder ? 'Photo selected' : '');
  const [voiceFileName, setVoiceFileName] = useState(editingKeepsake?.voicePlaceholder ? 'Voice note selected' : '');
  const [videoFileName, setVideoFileName] = useState(editingKeepsake?.videoPlaceholder ? 'Video selected' : '');
  const [handwrittenFileName, setHandwrittenFileName] = useState(editingKeepsake?.handwrittenPlaceholder ? 'Handwritten note selected' : '');
  const [coverImage, setCoverImage] = useState(editingKeepsake?.coverImage ?? '');
  const [coverImageName, setCoverImageName] = useState(editingKeepsake?.coverImageName ?? '');
  const [unlockType, setUnlockType] = useState(editingKeepsake?.unlockType === 'date' ? 'Unlock on date' : 'None');
  const [unlockDate, setUnlockDate] = useState(editingKeepsake?.unlockDate ?? '');
  const [memoryMood, setMemoryMood] = useState<MemoryMood>(editingKeepsake?.memoryMood ?? 'Tender');
  const [tagsInput, setTagsInput] = useState((editingKeepsake?.memoryTags ?? []).join(', '));
  const [visibility, setVisibility] = useState<KeepsakeVisibility>(editingKeepsake?.visibility ?? 'private');
  const [legacyVault, setLegacyVault] = useState(editingKeepsake?.legacyVault ?? false);
  const [futureDelivery, setFutureDelivery] = useState(editingKeepsake?.futureDelivery ?? false);
  const [collectionName, setCollectionName] = useState(editingKeepsake?.collectionName ?? '');
  const [timelineJourney, setTimelineJourney] = useState(editingKeepsake?.timelineJourney ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showToast, setShowToast] = useState(false);

  const selectedIntent = emotionalIntents.find((item) => item.intent === emotionalIntent) ?? emotionalIntents[0];
  const selectedType = useMemo(
    () => memoryTypes.find((item) => item.label === memoryType) ?? memoryTypes[2],
    [memoryType],
  );
  const message = joinAnswers(answers);
  const quotePreview = message || 'A memory begins with one honest detail.';
  const progress = step === 'intent' ? 1 : step === 'reflection' ? 2 : step === 'media' ? 3 : 4;

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

  function updateAnswer(value: string) {
    setAnswers((current) => current.map((answer, index) => (index === activePromptIndex ? value : answer)));
  }

  function validateBeforePreview() {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'Give this keepsake a gentle title.';
    if (!person.trim()) nextErrors.person = 'Add the person or family connected to this memory.';
    if (!memoryDate && !approximateTimePeriod.trim()) nextErrors.time = 'Add a date or approximate time period.';
    if (!message.trim()) nextErrors.message = 'Answer at least one reflection prompt.';
    if (unlockType === 'Unlock on date' && !unlockDate) nextErrors.unlockDate = 'Choose the date this keepsake should unlock.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function goToPreview() {
    if (!validateBeforePreview()) return;
    setStep('preview');
  }

  function handleSave() {
    if (!validateBeforePreview()) {
      setStep('reflection');
      return;
    }

    const input = {
      ideaType: type || memoryType,
      recipientType,
      title: title.trim(),
      message: message.trim(),
      unlockType: unlockType === 'Unlock on date' ? 'date' : 'none',
      unlockDate: unlockType === 'Unlock on date' ? unlockDate : undefined,
      memoryType,
      person: person.trim(),
      memoryDate: memoryDate || undefined,
      approximateTimePeriod: approximateTimePeriod.trim() || undefined,
      photoPlaceholder: Boolean(photoFileName || coverImage),
      voicePlaceholder: Boolean(voiceFileName),
      videoPlaceholder: Boolean(videoFileName),
      handwrittenPlaceholder: Boolean(handwrittenFileName),
      emotionalIntent,
      memoryMood,
      memoryTags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
      coverImage: coverImage || undefined,
      coverImageName: coverImageName || undefined,
      visibility,
      futureDelivery,
      legacyVault,
      collectionName: collectionName.trim() || undefined,
      timelineJourney: timelineJourney.trim() || undefined,
    } as const;

    const keepsake = editingKeepsake ? updateKeepsake(editingKeepsake.id, input) : createKeepsake(input);
    setShowToast(true);
    window.setTimeout(() => {
      if (keepsake) navigate(`/keepsakes/${keepsake.id}`);
    }, 650);
  }

  async function handleCoverUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setCoverImage(await readImageFile(file));
    setCoverImageName(file.name);
    setPhotoFileName(file.name);
  }

  return (
    <section className="ks-ambient-stage relative w-full overflow-hidden rounded-[1.75rem] px-0 py-1">
      <div className="ks-particles" aria-hidden="true" />
      <div className="relative z-[1] space-y-6 md:space-y-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-blush">
            {editingKeepsake ? 'Refine this keepsake' : 'Create Keepsake'}
          </p>
          <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-white md:text-5xl lg:text-6xl">
            Let the memory arrive slowly.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-xl md:leading-8">
            This is not paperwork. It is a quiet place to preserve what matters.
          </p>
        </div>

        <div className="mx-auto flex max-w-2xl items-center gap-2 px-2">
          {[1, 2, 3, 4].map((item) => (
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/18" key={item}>
              <div
                className="h-full rounded-full bg-keepsake-accent transition-all duration-500"
                style={{ width: progress >= item ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        {step === 'intent' ? (
          <section className="ks-cinematic-in grid gap-5">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-heading text-4xl font-bold leading-none text-white md:text-5xl">What are you trying to preserve?</h2>
              <p className="mt-4 text-base leading-7 text-white/72">Choose the emotional shape of this keepsake first.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {emotionalIntents.map((item) => {
                const Icon = item.icon;
                const isSelected = emotionalIntent === item.intent;
                return (
                  <button
                    className={[
                      'ks-emotion-card group min-h-48 rounded-[1.5rem] border p-5 text-left shadow-keepsake transition duration-300 active:scale-[0.98]',
                      isSelected ? 'border-keepsake-accent bg-white/90 ring-2 ring-keepsake-accent/35' : 'border-white/20 bg-white/80 hover:bg-white/90',
                    ].join(' ')}
                    key={item.intent}
                    type="button"
                    onClick={() => setEmotionalIntent(item.intent)}
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-keepsake-blush text-keepsake-roseDeep shadow-soft transition group-hover:scale-105">
                      <Icon size={25} aria-hidden="true" />
                    </span>
                    <span className="mt-5 block font-heading text-3xl font-bold leading-none text-keepsake-ink">{item.intent}</span>
                    <span className="mt-3 block text-sm leading-6 text-keepsake-muted">{item.description}</span>
                    <span className="mt-4 block text-xs font-extrabold uppercase tracking-[0.08em] text-keepsake-accentStrong">{item.supportive}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center">
              <button className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-6 text-sm font-extrabold" type="button" onClick={() => setStep('reflection')}>
                Begin reflection
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </section>
        ) : null}

        {step === 'reflection' ? (
          <section className="ks-cinematic-in mx-auto grid max-w-4xl gap-6">
            <div className="ks-card p-5 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">{selectedIntent.intent}</p>
                  <h2 className="mt-2 font-heading text-4xl font-bold leading-none text-keepsake-ink md:text-5xl">
                    {reflectionPrompts[activePromptIndex]}
                  </h2>
                </div>
                <p className="rounded-full bg-keepsake-cream px-4 py-2 text-sm font-extrabold text-keepsake-muted">
                  {activePromptIndex + 1} of {reflectionPrompts.length}
                </p>
              </div>

              <textarea
                className="mt-7 min-h-56 w-full resize-none rounded-[1.35rem] border border-keepsake-roseDeep/10 bg-keepsake-cream px-5 py-4 text-lg leading-8 text-keepsake-ink shadow-soft outline-none transition placeholder:text-keepsake-muted/60 focus:border-keepsake-accent focus:ring-2 focus:ring-keepsake-accent/25"
                value={answers[activePromptIndex]}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder="Write the detail as it comes to you..."
              />
              {errors.message ? <p className="mt-3 text-sm font-bold text-keepsake-roseDeep">{errors.message}</p> : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {reflectionPrompts.map((prompt, index) => (
                  <button
                    className={[
                      'h-3 flex-1 rounded-full transition',
                      index === activePromptIndex ? 'bg-keepsake-accent' : answers[index] ? 'bg-keepsake-roseDeep/45' : 'bg-keepsake-roseDeep/12',
                    ].join(' ')}
                    key={prompt}
                    type="button"
                    onClick={() => setActivePromptIndex(index)}
                    aria-label={`Go to prompt ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">A title for this memory</span>
                  <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Grandma's kitchen on Sunday" />
                  {errors.title ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.title}</span> : null}
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Who is connected to it?</span>
                  <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={person} onChange={(event) => setPerson(event.target.value)} placeholder="Mom, Grandpa, Emma..." />
                  {errors.person ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.person}</span> : null}
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Date</span>
                  <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" type="date" value={memoryDate} onChange={(event) => setMemoryDate(event.target.value)} />
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Or approximate time period</span>
                  <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={approximateTimePeriod} onChange={(event) => setApproximateTimePeriod(event.target.value)} placeholder="Summer 2019, childhood, first year..." />
                </label>
              </div>
              {errors.time ? <p className="mt-3 text-sm font-bold text-keepsake-roseDeep">{errors.time}</p> : null}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-keepsake-accentStrong shadow-soft" type="button" onClick={() => setStep('intent')}>
                  <ArrowLeft size={17} aria-hidden="true" />
                  Back
                </button>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-keepsake-cream px-5 text-sm font-extrabold text-keepsake-roseDeep shadow-soft" type="button" onClick={() => setActivePromptIndex(Math.min(reflectionPrompts.length - 1, activePromptIndex + 1))}>
                    Next prompt
                  </button>
                  <button className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-extrabold" type="button" onClick={() => setStep('media')}>
                    Add memory media
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {step === 'media' ? (
          <section className="ks-cinematic-in mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="ks-card p-5 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Memory media</p>
              <h2 className="mt-2 font-heading text-4xl font-bold leading-none text-keepsake-ink md:text-5xl">
                Let the memory have texture.
              </h2>
              <p className="mt-4 text-base leading-7 text-keepsake-muted">
                Add the photo, voice, video, or handwritten note that helps this memory feel alive.
              </p>

              <div className="mt-7 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div className="rounded-[1.35rem] bg-keepsake-blush/55 p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Memory shape</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {memoryTypes.map((item) => {
                      const Icon = item.icon;
                      const isSelected = memoryType === item.label;
                      return (
                        <button
                          className={[
                            'rounded-2xl px-4 py-3 text-left text-sm font-extrabold transition active:scale-[0.98]',
                            isSelected ? 'bg-keepsake-ink text-white shadow-soft' : 'bg-white/82 text-keepsake-ink hover:shadow-glow',
                          ].join(' ')}
                          key={item.label}
                          type="button"
                          onClick={() => setMemoryType(item.label)}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Icon size={16} aria-hidden="true" />
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-keepsake-muted">{selectedType.description}</p>
                </div>
                <label className="grid content-start gap-2 rounded-[1.35rem] bg-keepsake-cream p-4 shadow-soft">
                  <span className="ks-form-label text-sm font-bold">Who is this for?</span>
                  <select className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-white px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={recipientType} onChange={(event) => setRecipientType(event.target.value as RecipientType)}>
                    <option>Myself</option>
                    <option>Someone Else</option>
                  </select>
                  <span className="text-sm leading-6 text-keepsake-muted">Keepsake can later use this for sharing, delivery, and privacy defaults.</span>
                </label>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <label className="ks-media-drop">
                  <Camera size={24} aria-hidden="true" />
                  <span>Choose a Cover Photo</span>
                  <small>{coverImageName || photoFileName || 'A visual anchor for this keepsake'}</small>
                  <input className="sr-only" type="file" accept="image/*" onChange={(event) => void handleCoverUpload(event.target.files)} />
                </label>
                <label className="ks-media-drop ks-media-drop-voice">
                  <Mic size={24} aria-hidden="true" />
                  <span>Preserve Their Voice</span>
                  <small>{voiceFileName || 'Record a memory or capture the way they laugh'}</small>
                  <input className="sr-only" type="file" accept="audio/*" onChange={(event) => setVoiceFileName(event.target.files?.[0]?.name ?? '')} />
                </label>
                <label className="ks-media-drop">
                  <Video size={24} aria-hidden="true" />
                  <span>Optional Video Placeholder</span>
                  <small>{videoFileName || 'A moving memory can live here later'}</small>
                  <input className="sr-only" type="file" accept="video/*" onChange={(event) => setVideoFileName(event.target.files?.[0]?.name ?? '')} />
                </label>
                <label className="ks-media-drop">
                  <FilePenLine size={24} aria-hidden="true" />
                  <span>Handwritten Note Placeholder</span>
                  <small>{handwrittenFileName || 'A scanned letter, recipe, or card can be attached'}</small>
                  <input className="sr-only" type="file" accept="image/*,.pdf" onChange={(event) => setHandwrittenFileName(event.target.files?.[0]?.name ?? '')} />
                </label>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Memory mood</span>
                  <select className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={memoryMood} onChange={(event) => setMemoryMood(event.target.value as MemoryMood)}>
                    {moodOptions.map((mood) => <option key={mood}>{mood}</option>)}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Memory tags</span>
                  <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="family, kitchen, childhood" />
                </label>
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Unlock type</span>
                  <select className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" value={unlockType} onChange={(event) => setUnlockType(event.target.value)}>
                    <option>None</option>
                    <option>Unlock on date</option>
                  </select>
                </label>
                {unlockType === 'Unlock on date' ? (
                  <label className="grid gap-2">
                    <span className="ks-form-label text-sm font-bold">Future delivery date</span>
                    <input className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink shadow-soft outline-none focus:ring-2 focus:ring-keepsake-accent/25" type="date" value={unlockDate} onChange={(event) => setUnlockDate(event.target.value)} />
                    {errors.unlockDate ? <span className="text-sm font-semibold text-keepsake-roseDeep">{errors.unlockDate}</span> : null}
                  </label>
                ) : null}
              </div>
            </div>

            <aside className="ks-card p-5 md:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Legacy scaffolding</p>
              <h3 className="mt-2 font-heading text-3xl font-bold leading-none text-keepsake-ink">Prepare how it may live later.</h3>
              <div className="mt-5 grid gap-3">
                <label className="grid gap-2">
                  <span className="ks-form-label text-sm font-bold">Visibility</span>
                  <select className="min-h-11 rounded-2xl bg-keepsake-cream px-4 font-bold text-keepsake-ink" value={visibility} onChange={(event) => setVisibility(event.target.value as KeepsakeVisibility)}>
                    <option value="private">Private</option>
                    <option value="family">Family-only</option>
                    <option value="public">Public story</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/60 px-4 py-3 text-sm font-bold text-keepsake-roseDeep">
                  <input className="h-4 w-4 accent-keepsake-roseDeep" type="checkbox" checked={futureDelivery} onChange={(event) => setFutureDelivery(event.target.checked)} />
                  Future delivery
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-keepsake-sageSoft/80 px-4 py-3 text-sm font-bold text-keepsake-ink">
                  <input className="h-4 w-4 accent-keepsake-accent" type="checkbox" checked={legacyVault} onChange={(event) => setLegacyVault(event.target.checked)} />
                  Add to Legacy Vault
                </label>
                <input className="min-h-11 rounded-2xl bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none" value={collectionName} onChange={(event) => setCollectionName(event.target.value)} placeholder="Memory collection name" />
                <input className="min-h-11 rounded-2xl bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none" value={timelineJourney} onChange={(event) => setTimelineJourney(event.target.value)} placeholder="Timeline journey, e.g. Childhood" />
              </div>
              <p className="mt-5 text-sm leading-6 text-keepsake-muted">Family sharing, legacy vaults, future delivery, and timeline journeys are ready in the UI model for backend wiring later.</p>
            </aside>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between lg:col-span-2">
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-keepsake-accentStrong shadow-soft" type="button" onClick={() => setStep('reflection')}>
                <ArrowLeft size={17} aria-hidden="true" />
                Back to reflection
              </button>
              <button className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-extrabold" type="button" onClick={goToPreview}>
                Preview keepsake
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </section>
        ) : null}

        {step === 'preview' ? (
          <section className="ks-cinematic-in mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="ks-memory-preview overflow-hidden rounded-[1.75rem] border border-white/20 bg-white/88 shadow-keepsake">
              <div className="relative min-h-64 overflow-hidden bg-gradient-to-br from-keepsake-blush via-keepsake-cream to-keepsake-sageSoft">
                {coverImage ? <img className="absolute inset-0 h-full w-full object-cover opacity-90" src={coverImage} alt="" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#352a2a]/72 via-[#352a2a]/12 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-white/78">{memoryMood} - {memoryType}</p>
                  <h2 className="mt-2 font-heading text-4xl font-bold leading-none text-white md:text-6xl">{title || 'Untitled Keepsake'}</h2>
                </div>
              </div>
              <div className="grid gap-5 p-5 md:p-7">
                <blockquote className="font-heading text-3xl font-bold leading-snug text-keepsake-ink">
                  "{quotePreview.slice(0, 180)}{quotePreview.length > 180 ? '...' : ''}"
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-keepsake-blush px-3 py-1 text-xs font-extrabold text-keepsake-roseDeep">{person || 'Someone meaningful'}</span>
                  <span className="rounded-full bg-keepsake-cream px-3 py-1 text-xs font-extrabold text-keepsake-muted">{getTimeLabel(memoryDate, approximateTimePeriod)}</span>
                  {voiceFileName ? <span className="rounded-full bg-keepsake-sageSoft px-3 py-1 text-xs font-extrabold text-keepsake-ink">Voice preserved</span> : null}
                  {unlockType === 'Unlock on date' ? <span className="rounded-full bg-keepsake-ink px-3 py-1 text-xs font-extrabold text-white">Unlocks later</span> : null}
                </div>
              </div>
            </div>

            <aside className="ks-card p-5 md:p-6">
              <Sparkles className="text-keepsake-accentStrong" size={26} aria-hidden="true" />
              <h3 className="mt-4 font-heading text-3xl font-bold leading-none text-keepsake-ink">This is meaningful.</h3>
              <p className="mt-4 text-sm leading-6 text-keepsake-muted">You are turning a memory into something someone can return to. Some stories deserve to last.</p>
              <div className="mt-6 grid gap-3">
                <button className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-extrabold" type="button" onClick={handleSave}>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Save this keepsake
                </button>
                <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-keepsake-accentStrong shadow-soft" type="button" onClick={() => setStep('media')}>
                  <ArrowLeft size={17} aria-hidden="true" />
                  Adjust media
                </button>
              </div>
            </aside>
          </section>
        ) : null}
      </div>

      {showToast ? (
        <div className="fixed inset-x-4 bottom-24 z-20 mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-keepsake-sage/20 bg-keepsake-ink px-4 py-3 text-white shadow-keepsake" role="status">
          <CheckCircle2 className="shrink-0 text-keepsake-sage" size={21} aria-hidden="true" />
          <p className="text-sm font-bold">Keepsake saved. Future you will thank you.</p>
        </div>
      ) : null}
    </section>
  );
}
