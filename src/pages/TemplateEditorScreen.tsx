import { ArrowDown, ArrowUp, CheckCircle2, Download, Film, Sparkles, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatedKeepsakeRenderer } from '../components/AnimatedKeepsakeRenderer';
import { ExportDialog } from '../components/ExportDialog';
import { createMediaAssetFromFile } from '../components/MediaEngine';
import type { TemplateMedia } from '../components/MediaEngine';
import { TemplateEngine } from '../components/TemplateEngine';
import { TemplatePreview } from '../components/TemplatePreview';
import { backgroundStyles, templateRegistry } from '../data/templates';
import type { AnimationExportFormat, AnimationStyle, ExportSettings, PrintSize, StorySuggestion, StoryTone } from '../models/keepsake';
import type { MemoryItem } from '../models/memory';
import { getDefaultAnimationMetadata } from '../hooks/useAnimationEngine';
import { useStoryEngine } from '../hooks/useStoryEngine';
import { exportAnimatedKeepsake } from '../services/animatedExportService';
import { getCurrentUser } from '../services/authService';
import { createKeepsake, updateKeepsake } from '../services/keepsakeStorage';
import { getMemoryItems } from '../services/memoryStorage';
import { createQrRecord } from '../services/qrService';

function isMemoryItem(item: MemoryItem | undefined): item is MemoryItem {
  return Boolean(item);
}

function parsePhotoIds(value: string | null) {
  return (value ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .map((id) => id.replace(/^photo-/, ''));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = items.slice();
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

const animationOptions: { label: string; value: AnimationStyle }[] = [
  { label: 'None', value: 'none' },
  { label: 'Gentle Fade', value: 'gentleFade' },
  { label: 'Pan & Zoom', value: 'panAndZoom' },
  { label: 'Scrapbook Reveal', value: 'scrapbookReveal' },
  { label: 'Filmstrip Scroll', value: 'filmstripScroll' },
];

const exportOptions: { label: string; value: AnimationExportFormat }[] = [
  { label: 'Static', value: 'static' },
  { label: 'MP4', value: 'mp4' },
  { label: 'GIF', value: 'gif' },
  { label: 'WebM', value: 'webm' },
];

const toneOptions: { label: string; value: StoryTone }[] = [
  { label: 'Warm', value: 'warm' },
  { label: 'Nostalgic', value: 'nostalgic' },
  { label: 'Playful', value: 'playful' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Documentary', value: 'documentary' },
];

export function TemplateEditorScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const photoIds = useMemo(() => {
    const directIds = [...parsePhotoIds(searchParams.get('photoIds')), ...parsePhotoIds(searchParams.get('photoId'))];
    const timelinePhotoIds = parsePhotoIds(searchParams.get('timelineIds'));
    return Array.from(new Set([...directIds, ...timelinePhotoIds]));
  }, [searchParams]);
  const initialPhotos = useMemo(() => {
    const memoryItems = getMemoryItems();
    return photoIds
      .map((id) => memoryItems.find((item) => item.id === id))
      .filter(isMemoryItem)
      .map((item) => ({
        id: item.id,
        src: item.src,
        type: 'photo' as const,
        thumbnailUrl: item.src,
        qrLinkedContent: { fileId: item.id, contentType: 'photo' as const },
      }));
  }, [photoIds]);
  const [mediaItems, setMediaItems] = useState<TemplateMedia[]>(initialPhotos);
  const [templateId, setTemplateId] = useState(templateRegistry[0].id);
  const [title, setTitle] = useState('Untitled Keepsake');
  const [body, setBody] = useState('');
  const [backgroundStyle, setBackgroundStyle] = useState('warm');
  const [showQrPlaceholder, setShowQrPlaceholder] = useState(false);
  const [showPlaybackControls, setShowPlaybackControls] = useState(true);
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('none');
  const [animationExportFormat, setAnimationExportFormat] = useState<AnimationExportFormat>('webm');
  const [previewMode, setPreviewMode] = useState<'static' | 'animated'>('static');
  const [exportMessage, setExportMessage] = useState('');
  const [printExportSettings, setPrintExportSettings] = useState<ExportSettings>();
  const [printSize, setPrintSize] = useState<PrintSize>('8x10');
  const [dpi, setDpi] = useState(300);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [storyTone, setStoryTone] = useState<StoryTone>('warm');
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<StorySuggestion[]>([]);
  const [storyDrafts, setStoryDrafts] = useState<Record<string, string>>({});
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [saved, setSaved] = useState(false);
  const {
    error: storyError,
    generate: generateStory,
    isGenerating: isGeneratingStory,
    regenerate: regenerateStory,
    suggestions: storySuggestions,
  } = useStoryEngine();

  const selectedTemplate = templateRegistry.find((template) => template.id === templateId) ?? templateRegistry[0];
  const photos = mediaItems.filter((item) => item.type === 'photo').map((item) => ({ id: item.id, src: item.src }));
  const mediaType = mediaItems.some((item) => item.type === 'video')
    ? 'video'
    : mediaItems.some((item) => item.type === 'audio')
      ? 'audio'
      : 'photo';
  const animationMetadata = getDefaultAnimationMetadata(animationStyle, animationExportFormat);
  const storyArgs = useMemo(
    () => ({
      animationStyle,
      mediaItems,
      template: selectedTemplate,
      templateId,
      tone: storyTone,
      userText: body,
    }),
    [animationStyle, body, mediaItems, selectedTemplate, storyTone, templateId],
  );
  const templateRenderData = useMemo(
    () => ({
      photos,
      media: mediaItems,
      title,
      body,
      backgroundStyle,
      eventTag: selectedTemplate.category,
      showQrPlaceholder,
      showPlaybackControls,
      highResolution: true,
    }),
    [backgroundStyle, body, mediaItems, photos, selectedTemplate.category, showPlaybackControls, showQrPlaceholder, title],
  );

  useEffect(() => {
    if (hasAutofilled || body.trim()) {
      return;
    }

    void generateStory(storyArgs).then((nextSuggestions) => {
      const firstSuggestion = nextSuggestions[0];
      if (!firstSuggestion || hasAutofilled || body.trim()) {
        return;
      }

      setTitle((currentTitle) => (currentTitle === 'Untitled Keepsake' ? firstSuggestion.title : currentTitle));
      setBody(firstSuggestion.body);
      setHasAutofilled(true);
    });
  }, [body, generateStory, hasAutofilled, storyArgs]);

  async function handleAnimationExport() {
    const result = await exportAnimatedKeepsake({
      animationStyle,
      metadata: animationMetadata,
      title: title.trim() || selectedTemplate.name,
    });
    setExportMessage(`${result.fileName} prepared as ${result.mimeType}.`);
  }

  async function handleGenerateStory(force = false) {
    const nextSuggestions = force ? await regenerateStory(storyArgs) : await generateStory(storyArgs);
    if (!nextSuggestions.length) {
      return;
    }

    if (!body.trim()) {
      setBody(nextSuggestions[0].body);
    }
  }

  function handleAcceptSuggestion(suggestion: StorySuggestion) {
    const key = `${suggestion.title}-${suggestion.confidence}`;
    const acceptedSuggestion = { ...suggestion, body: storyDrafts[key] ?? suggestion.body };
    setTitle(acceptedSuggestion.title);
    setBody(acceptedSuggestion.body);
    setAcceptedSuggestions((current) => [acceptedSuggestion, ...current.filter((item) => item.title !== acceptedSuggestion.title)]);
  }

  async function handleMediaUpload(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsProcessingMedia(true);
    const nextMedia = await Promise.all(Array.from(files).map((file) => createMediaAssetFromFile(file)));
    setMediaItems((current) => [...current, ...nextMedia]);

    const firstUploadedType = nextMedia[0]?.type;
    if (firstUploadedType === 'video') {
      setTemplateId('video-memory-page');
    } else if (firstUploadedType === 'audio') {
      setTemplateId('audio-story-page');
    } else if (nextMedia.some((item) => item.type !== 'photo') || mediaItems.some((item) => item.type !== 'photo')) {
      setTemplateId('mixed-media-collage');
    }

    setIsProcessingMedia(false);
  }

  function handleTemplateSelect(nextTemplateId: string) {
    const nextTemplate = templateRegistry.find((template) => template.id === nextTemplateId);
    const user = getCurrentUser();

    if (nextTemplate?.requiresPro && !user.isPro) {
      navigate(`/paywall?feature=template-${nextTemplateId}`);
      return;
    }

    setTemplateId(nextTemplateId);
  }

  function handleSave() {
    const keepsake = createKeepsake({
      ideaType: selectedTemplate.category,
      recipientType: 'Myself',
      title: title.trim() || selectedTemplate.name,
      message: body.trim() || 'A designed keepsake page.',
      unlockType: 'none',
      templateId,
      photoIds: photos.map((photo) => photo.id),
      mediaType,
      mediaIds: mediaItems.map((media) => media.id),
      mediaItems,
      thumbnailUrl: mediaItems.find((media) => media.thumbnailUrl)?.thumbnailUrl,
      duration: mediaItems.reduce((total, media) => total + (media.duration ?? 0), 0) || undefined,
      body,
      backgroundStyle,
      showPlaybackControls,
      animationStyle,
      animationMetadata,
      storySuggestions: [...acceptedSuggestions, ...storySuggestions].slice(0, 6),
      exportSettings: printExportSettings,
      printSize,
      dpi,
    });

    if (showQrPlaceholder || animationStyle !== 'none') {
      const qrRecord = createQrRecord({
        content: mediaItems,
        title: title.trim() || selectedTemplate.name,
        animationStyle,
        animationMetadata,
        keepsakeId: keepsake.id,
      });
      updateKeepsake(keepsake.id, { qrCodeId: qrRecord.id });
    }

    setSaved(true);
    window.setTimeout(() => navigate(`/keepsakes/${keepsake.id}`), 650);
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
          Template Studio
        </p>
        <h1 className="font-heading text-[3rem] font-bold leading-[0.94] tracking-normal text-keepsake-ink md:text-5xl lg:text-6xl">
          Design the memory.
        </h1>
        <p className="mt-5 text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
          Choose a layout, arrange photos, and shape the text into a print-ready keepsake.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Templates</h2>
                <p className="mt-1 text-sm leading-6 text-keepsake-muted">
                  Unlock more layouts, backgrounds, frames, and animation styles from the marketplace.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:flex md:flex-wrap md:justify-end">
                {[
                  { label: 'Templates', to: '/marketplace?type=template' },
                  { label: 'Backgrounds', to: '/marketplace?type=background' },
                  { label: 'Frames', to: '/marketplace?type=frame' },
                  { label: 'Animations', to: '/marketplace?type=animation' },
                ].map((link) => (
                  <Link
                    className="rounded-full bg-keepsake-cream px-3 py-2 text-center text-xs font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
                    key={link.to}
                    to={link.to}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {templateRegistry.map((template) => (
                <TemplatePreview
                  isSelected={template.id === templateId}
                  key={template.id}
                  template={template}
                  onSelect={() => handleTemplateSelect(template.id)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake md:p-6">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Content</h2>
            <div className="mt-4 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Add Media</span>
                <span className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-keepsake-roseDeep px-4 text-sm font-extrabold text-white shadow-soft transition hover:bg-keepsake-rose">
                  <Upload size={17} aria-hidden="true" />
                  {isProcessingMedia ? 'Preparing media...' : 'Upload photo, video, or audio'}
                  <input
                    className="sr-only"
                    type="file"
                    accept="image/*,video/*,audio/*"
                    multiple
                    onChange={(event) => {
                      void handleMediaUpload(event.target.files);
                      event.target.value = '';
                    }}
                  />
                </span>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Title</span>
                <input
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Body Text</span>
                <textarea
                  className="min-h-32 resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 py-3 text-base leading-7 text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Tell the story behind these photos..."
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Background</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-rose focus:ring-2 focus:ring-keepsake-rose/25"
                  value={backgroundStyle}
                  onChange={(event) => setBackgroundStyle(event.target.value)}
                >
                  {backgroundStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/50 px-4 py-3 text-sm font-bold text-keepsake-roseDeep">
                <input
                  className="h-4 w-4 accent-keepsake-roseDeep"
                  type="checkbox"
                  checked={showQrPlaceholder}
                  onChange={(event) => setShowQrPlaceholder(event.target.checked)}
                />
                Show QR placeholder
              </label>
              <label className="flex items-center gap-3 rounded-2xl bg-keepsake-blush/50 px-4 py-3 text-sm font-bold text-keepsake-roseDeep">
                <input
                  className="h-4 w-4 accent-keepsake-roseDeep"
                  type="checkbox"
                  checked={showPlaybackControls}
                  onChange={(event) => setShowPlaybackControls(event.target.checked)}
                />
                Show playback controls
              </label>
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-keepsake-ink">AI Story</h2>
                <p className="mt-2 text-sm leading-6 text-keepsake-muted">
                  Generate titles, captions, summaries, and emotional narratives from your media and template context.
                </p>
              </div>
              <button
                className="ks-button-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-extrabold"
                type="button"
                onClick={() => void handleGenerateStory(true)}
              >
                <Sparkles size={16} aria-hidden="true" />
                {isGeneratingStory ? 'Generating...' : 'Generate Story'}
              </button>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Tone</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-accent focus:ring-2 focus:ring-keepsake-accent/25"
                  value={storyTone}
                  onChange={(event) => setStoryTone(event.target.value as StoryTone)}
                >
                  {toneOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {storyError ? (
                <p className="rounded-2xl bg-keepsake-blush px-4 py-3 text-sm font-bold text-keepsake-roseDeep">
                  {storyError}
                </p>
              ) : null}

              {storySuggestions.length > 0 ? (
                <div className="grid gap-3">
                  {storySuggestions.map((suggestion) => {
                    const key = `${suggestion.title}-${suggestion.confidence}`;
                    return (
                      <article className="rounded-keepsake bg-keepsake-cream p-4 shadow-soft" key={key}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
                              {suggestion.tone} - {Math.round(suggestion.confidence * 100)}% fit
                            </p>
                            <h3 className="mt-2 font-heading text-2xl font-bold text-keepsake-ink">{suggestion.title}</h3>
                          </div>
                          <button
                            className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
                            type="button"
                            onClick={() => handleAcceptSuggestion(suggestion)}
                          >
                            Accept
                          </button>
                        </div>
                        <textarea
                          className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-keepsake-roseDeep/10 bg-white/80 px-4 py-3 text-sm leading-6 text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-accent/25"
                          value={storyDrafts[key] ?? suggestion.body}
                          onChange={(event) => setStoryDrafts((current) => ({ ...current, [key]: event.target.value }))}
                        />
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-keepsake bg-keepsake-cream px-4 py-3 text-sm font-semibold text-keepsake-muted">
                  Smart Autofill will suggest a title and body when a template or media is selected.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake md:p-6">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Animation</h2>
            <div className="mt-4 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Animation style</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-accent focus:ring-2 focus:ring-keepsake-accent/25"
                  value={animationStyle}
                  onChange={(event) => {
                    const nextStyle = event.target.value as AnimationStyle;
                    setAnimationStyle(nextStyle);
                    setPreviewMode(nextStyle === 'none' ? 'static' : 'animated');
                  }}
                >
                  {animationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold text-keepsake-ink">Export option</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 text-base font-semibold text-keepsake-ink shadow-soft outline-none focus:border-keepsake-accent focus:ring-2 focus:ring-keepsake-accent/25"
                  value={animationExportFormat}
                  onChange={(event) => setAnimationExportFormat(event.target.value as AnimationExportFormat)}
                >
                  {exportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={[
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold shadow-soft transition active:scale-[0.96]',
                    previewMode === 'animated'
                      ? 'bg-keepsake-accent text-white'
                      : 'bg-white text-keepsake-accentStrong',
                  ].join(' ')}
                  type="button"
                  onClick={() => setPreviewMode('animated')}
                >
                  <Sparkles size={16} aria-hidden="true" />
                  Animated
                </button>
                <button
                  className={[
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold shadow-soft transition active:scale-[0.96]',
                    previewMode === 'static'
                      ? 'bg-keepsake-accent text-white'
                      : 'bg-white text-keepsake-accentStrong',
                  ].join(' ')}
                  type="button"
                  onClick={() => setPreviewMode('static')}
                >
                  Static
                </button>
              </div>
              <button
                className="ks-button-primary inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-extrabold"
                type="button"
                onClick={() => void handleAnimationExport()}
              >
                <Download size={16} aria-hidden="true" />
                Prepare export
              </button>
              {exportMessage ? (
                <p className="rounded-2xl bg-keepsake-ink px-4 py-3 text-sm font-bold text-white">{exportMessage}</p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake md:p-6">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Media Slots</h2>
            {mediaItems.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-keepsake-muted">
                No media selected yet. Start from Memory Box, Timeline range selection, or upload files here.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {mediaItems.map((media, index) => (
                  <div className="flex items-center gap-3 rounded-2xl bg-keepsake-cream p-2" key={media.id}>
                    <img className="h-16 w-16 rounded-xl object-cover" src={media.thumbnailUrl ?? media.src} alt="" loading="lazy" decoding="async" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-keepsake-ink">Slot {index + 1}</p>
                      <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-muted">
                        <Film size={12} aria-hidden="true" />
                        {media.type}
                      </p>
                    </div>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-keepsake-roseDeep shadow-soft"
                      type="button"
                      onClick={() => setMediaItems((current) => moveItem(current, index, -1))}
                      aria-label="Move media up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      className="grid h-9 w-9 place-items-center rounded-full bg-white text-keepsake-roseDeep shadow-soft"
                      type="button"
                      onClick={() => setMediaItems((current) => moveItem(current, index, 1))}
                      aria-label="Move media down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/78 p-4 shadow-keepsake">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
              Live Preview
            </p>
            {previewMode === 'animated' && animationStyle !== 'none' ? (
              <AnimatedKeepsakeRenderer
                animationMetadata={animationMetadata}
                animationStyle={animationStyle}
                data={templateRenderData}
                templateId={templateId}
              />
            ) : (
              <TemplateEngine
                templateId={templateId}
                data={templateRenderData}
              />
            )}
          </div>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition hover:shadow-glow"
            type="button"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download size={17} aria-hidden="true" />
            Print-ready export
          </button>
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-keepsake-roseDeep px-4 text-sm font-extrabold text-white shadow-soft transition hover:bg-keepsake-rose"
            type="button"
            onClick={handleSave}
          >
            {saved ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
            {saved ? 'Saved' : 'Save Designed Keepsake'}
          </button>
        </aside>
      </div>
      <ExportDialog
        data={templateRenderData}
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExported={(result, settings) => {
          setPrintExportSettings({
            exportType: settings.exportType,
            resolution: settings.resolution,
            colorProfile: settings.colorProfile,
            includeBleed: true,
            includeSafeZones: true,
            signedUrlExpiresAt: result.expiresAt,
          });
          setPrintSize(settings.printSize);
          setDpi(result.settings.dpi);
          setExportMessage(`${result.fileName} ready for download.`);
        }}
        templateId={templateId}
      />
    </section>
  );
}
