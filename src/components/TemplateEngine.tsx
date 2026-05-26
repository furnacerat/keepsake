import { getBackgroundClass, getTemplate } from '../data/templates';
import { MediaEngine } from './MediaEngine';
import type { TemplateMedia } from './MediaEngine';

export type TemplatePhoto = {
  id: string;
  src: string;
};

export type TemplateRenderData = {
  photos: TemplatePhoto[];
  media?: TemplateMedia[];
  title: string;
  body: string;
  eventTag?: string;
  date?: string;
  backgroundStyle: string;
  showQrPlaceholder?: boolean;
  showPlaybackControls?: boolean;
  highResolution?: boolean;
};

type TemplateEngineProps = {
  templateId: string;
  data: TemplateRenderData;
  printMode?: boolean;
};

function PhotoSlot({ photo, className = '', printMode = false }: { photo?: TemplatePhoto; className?: string; printMode?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-white/65 ${printMode ? '' : 'shadow-soft'} ${className}`}>
      {photo ? <img className="h-full w-full object-cover" src={photo.src} alt="" /> : null}
    </div>
  );
}

function QrPlaceholder({ label = 'QR', show }: { label?: string; show?: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <div className="grid h-16 w-16 place-items-center rounded-xl border border-dashed border-keepsake-roseDeep/35 bg-white/65 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-keepsake-muted">
      {label}
    </div>
  );
}

export function TemplateEngine({ data, printMode = false, templateId }: TemplateEngineProps) {
  const template = getTemplate(templateId);
  const backgroundClass = getBackgroundClass(data.backgroundStyle);
  const media: TemplateMedia[] =
    data.media ?? data.photos.map((photo) => ({ ...photo, type: 'photo' as const }));
  const firstVideo = media.find((item) => item.type === 'video');
  const firstAudio = media.find((item) => item.type === 'audio');
  const firstPhoto = media.find((item) => item.type === 'photo');
  const pageClass = [
    'relative overflow-hidden rounded-[1.5rem] border border-keepsake-roseDeep/10 bg-gradient-to-br p-5',
    printMode ? 'print:shadow-none print:transition-none' : 'shadow-keepsake',
    backgroundClass,
    template.orientation === 'landscape' ? 'aspect-[11/8.5]' : 'aspect-[8.5/11]',
    data.highResolution ? 'w-[1020px] max-w-full' : 'w-full',
  ].join(' ');

  if (template.id === 'video-memory-page') {
    return (
      <article className={pageClass}>
        <MediaEngine
          className="h-[64%]"
          controls={printMode ? false : data.showPlaybackControls}
          media={firstVideo}
          mode={printMode || !data.showPlaybackControls ? 'export' : 'page'}
        />
        <div className="mt-5 flex min-h-0 flex-1 flex-col justify-between rounded-2xl bg-white/74 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
              Video Memory
            </p>
            <h2 className="mt-2 font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
            <p className="mt-3 text-sm leading-6 text-keepsake-muted">{data.body}</p>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="text-xs font-semibold text-keepsake-muted">
              {firstVideo?.qrLinkedContent?.fileId ? `Linked media: ${firstVideo.qrLinkedContent.fileId}` : null}
            </p>
            <QrPlaceholder label="QR" show={data.showQrPlaceholder} />
          </div>
        </div>
      </article>
    );
  }

  if (template.id === 'audio-story-page') {
    return (
      <article className={pageClass}>
        <div className="flex h-full flex-col rounded-2xl bg-white/68 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
            Audio Story
          </p>
          <h2 className="mt-3 font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
          <MediaEngine
            className="mt-5 min-h-48 flex-1"
            controls={printMode ? false : data.showPlaybackControls}
            media={firstAudio}
            mode={printMode || !data.showPlaybackControls ? 'export' : 'page'}
          />
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-keepsake-muted">{data.body}</p>
        </div>
      </article>
    );
  }

  if (template.id === 'mixed-media-collage') {
    return (
      <article className={pageClass}>
        <div className="grid h-full grid-rows-[1.15fr_0.85fr] gap-4">
          <MediaEngine className="min-h-0" media={firstPhoto} mode="export" />
          <div className="grid min-h-0 grid-cols-[1.05fr_0.95fr] gap-4">
            <MediaEngine
              className="min-h-0"
              controls={printMode ? false : data.showPlaybackControls}
              media={firstVideo ?? media.find((item) => item.type !== 'photo')}
              mode={printMode || !data.showPlaybackControls ? 'export' : 'page'}
            />
            <div className="rounded-2xl bg-white/76 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">
                Mixed Media
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
              <p className="mt-3 text-sm leading-6 text-keepsake-muted">{data.body}</p>
              <QrPlaceholder show={data.showQrPlaceholder} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (template.id === 'full-page-photo') {
    return (
      <article className={pageClass}>
        <PhotoSlot photo={data.photos[0]} className="absolute inset-5" printMode={printMode} />
        <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/82 p-4 backdrop-blur">
          <h2 className="font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
          <p className="mt-2 text-sm leading-6 text-keepsake-muted">{data.body}</p>
        </div>
      </article>
    );
  }

  if (template.id === 'two-photo-spread') {
    return (
      <article className={pageClass}>
        <div className="grid h-full grid-cols-2 gap-4">
          <PhotoSlot photo={data.photos[0]} printMode={printMode} />
          <div className="grid gap-4">
            <PhotoSlot photo={data.photos[1]} printMode={printMode} />
            <div className="rounded-2xl bg-white/75 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">{data.eventTag}</p>
              <h2 className="mt-2 font-heading text-3xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
              <p className="mt-3 text-sm leading-6 text-keepsake-muted">{data.body}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (template.id === 'three-photo-grid') {
    return (
      <article className={pageClass}>
        <h2 className="font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
        <p className="mt-2 text-sm leading-6 text-keepsake-muted">{data.body}</p>
        <div className="mt-5 grid h-[64%] grid-cols-2 gap-3">
          <PhotoSlot photo={data.photos[0]} className="row-span-2" printMode={printMode} />
          <PhotoSlot photo={data.photos[1]} printMode={printMode} />
          <PhotoSlot photo={data.photos[2]} printMode={printMode} />
        </div>
      </article>
    );
  }

  if (template.id === 'scrapbook-collage') {
    return (
      <article className={pageClass}>
        <div className="grid h-full grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <PhotoSlot
              className={index === 0 ? 'col-span-2 row-span-2 rotate-[-1deg]' : index % 2 ? 'rotate-[1deg]' : ''}
              key={index}
              photo={data.photos[index]}
              printMode={printMode}
            />
          ))}
        </div>
        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/82 p-4">
          <h2 className="font-heading text-3xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
        </div>
      </article>
    );
  }

  if (template.id === 'letter-page') {
    return (
      <article className={pageClass}>
        <div className="flex h-full flex-col justify-between rounded-2xl bg-white/68 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">{data.date}</p>
            <h2 className="mt-4 font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
            <p className="mt-6 whitespace-pre-wrap font-heading text-2xl leading-snug text-keepsake-ink">{data.body}</p>
          </div>
          <QrPlaceholder show={data.showQrPlaceholder} />
        </div>
      </article>
    );
  }

  if (template.id === 'polaroid-memories') {
    return (
      <article className={pageClass}>
        <h2 className="font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
        <div className="mt-5 grid gap-3">
          {data.photos.slice(0, 3).map((photo, index) => (
            <div className={`rounded-xl bg-white p-2 shadow-soft ${index % 2 ? 'rotate-1' : '-rotate-1'}`} key={photo.id}>
              <PhotoSlot photo={photo} className="aspect-[4/3]" printMode={printMode} />
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm leading-6 text-keepsake-muted">{data.body}</p>
      </article>
    );
  }

  return (
    <article className={pageClass}>
      <div className="flex h-full flex-col">
        <PhotoSlot photo={data.photos[0]} className="h-[55%]" printMode={printMode} />
        <div className="mt-5 flex flex-1 flex-col justify-between rounded-2xl bg-white/70 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">{data.eventTag}</p>
            <h2 className="mt-2 font-heading text-4xl font-bold leading-none text-keepsake-ink">{data.title}</h2>
            <p className="mt-3 text-sm leading-6 text-keepsake-muted">{data.body}</p>
          </div>
          <QrPlaceholder show={data.showQrPlaceholder} />
        </div>
      </div>
    </article>
  );
}
