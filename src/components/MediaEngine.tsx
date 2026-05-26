import { FileAudio, FileVideo, Play } from 'lucide-react';
import type { KeepsakeMediaAsset, KeepsakeMediaType } from '../models/keepsake';

export type TemplateMedia = KeepsakeMediaAsset;

type MediaEngineProps = {
  className?: string;
  controls?: boolean;
  media?: TemplateMedia;
  mode?: 'preview' | 'page' | 'export';
};

function formatDuration(duration?: number) {
  if (!duration || !Number.isFinite(duration)) {
    return '';
  }

  const minutes = Math.floor(duration / 60);
  const seconds = Math.round(duration % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function createMediaId(type: KeepsakeMediaType) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${type}-${suffix}`;
}

export function extractQrLinkedMetadata(media: Pick<TemplateMedia, 'id' | 'src' | 'type'>) {
  return {
    url: media.src.startsWith('http') ? media.src : undefined,
    fileId: media.id,
    contentType: media.type,
  };
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function getMediaDuration(src: string, type: KeepsakeMediaType) {
  if (type === 'photo') {
    return Promise.resolve(undefined);
  }

  return new Promise<number | undefined>((resolve) => {
    const element = document.createElement(type === 'video' ? 'video' : 'audio');
    element.preload = 'metadata';
    element.src = src;
    element.onloadedmetadata = () => resolve(Number.isFinite(element.duration) ? element.duration : undefined);
    element.onerror = () => resolve(undefined);
  });
}

export function generateVideoThumbnail(src: string, timestamp = 0.2) {
  return new Promise<string | undefined>((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');

    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = src;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timestamp, Math.max(0, video.duration - 0.1));
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(undefined);
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    video.onerror = () => resolve(undefined);
  });
}

export function generateAudioWaveformThumbnail(label = 'Audio Story') {
  const bars = Array.from({ length: 24 })
    .map((_, index) => {
      const height = 18 + ((index * 17) % 54);
      const x = 24 + index * 10;
      return `<rect x="${x}" y="${88 - height / 2}" width="5" height="${height}" rx="2.5" fill="%23b96e6f" opacity="${0.45 + (index % 4) * 0.12}"/>`;
    })
    .join('');

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' rx='24' fill='%23fff7ed'/%3E%3Ccircle cx='260' cy='40' r='54' fill='%23c99c5f' opacity='.18'/%3E${bars}%3Ctext x='24' y='148' font-family='Inter, sans-serif' font-size='18' font-weight='700' fill='%23362622'%3E${encodeURIComponent(
    label,
  )}%3C/text%3E%3C/svg%3E`;
}

export async function createMediaAssetFromFile(file: File): Promise<TemplateMedia> {
  const type: KeepsakeMediaType = file.type.startsWith('video/')
    ? 'video'
    : file.type.startsWith('audio/')
      ? 'audio'
      : 'photo';
  const src = await fileToDataUrl(file);
  const id = createMediaId(type);
  const duration = await getMediaDuration(src, type);
  const thumbnailUrl =
    type === 'video'
      ? await generateVideoThumbnail(src)
      : type === 'audio'
        ? generateAudioWaveformThumbnail(file.name.replace(/\.[^.]+$/, ''))
        : src;

  return {
    id,
    type,
    src,
    duration,
    thumbnailUrl,
    fileName: file.name,
    qrLinkedContent: extractQrLinkedMetadata({ id, src, type }),
  };
}

function Waveform({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex h-full min-h-20 items-center gap-1">
      {Array.from({ length: compact ? 18 : 28 }).map((_, index) => (
        <span
          className="w-1 rounded-full bg-keepsake-accent/70"
          key={index}
          style={{ height: `${26 + ((index * 13) % 54)}%` }}
        />
      ))}
    </div>
  );
}

export function MediaEngine({ className = '', controls = true, media, mode = 'page' }: MediaEngineProps) {
  if (!media) {
    return (
      <div className={`grid place-items-center rounded-2xl bg-white/65 text-keepsake-muted shadow-soft ${className}`}>
        <span className="text-xs font-bold uppercase tracking-[0.08em]">Media</span>
      </div>
    );
  }

  if (media.type === 'photo') {
    return <img className={`ks-photo-reveal h-full w-full rounded-keepsake object-cover shadow-soft ${className}`} src={media.src} alt="" loading="lazy" decoding="async" />;
  }

  if (media.type === 'video') {
    return (
      <div className={`ks-photo-reveal relative overflow-hidden rounded-keepsake bg-keepsake-ink shadow-soft ${className}`}>
        {controls && mode !== 'export' ? (
          <video className="h-full w-full object-cover" controls poster={media.thumbnailUrl} src={media.src} />
        ) : (
          <img className="h-full w-full object-cover" src={media.thumbnailUrl ?? media.src} alt="" loading="lazy" decoding="async" />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white">
          <FileVideo size={12} aria-hidden="true" />
          Video {formatDuration(media.duration)}
        </span>
        {mode === 'preview' || !controls ? (
          <span className="absolute inset-0 grid place-items-center text-white">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/24 backdrop-blur">
              <Play size={20} fill="currentColor" aria-hidden="true" />
            </span>
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`ks-photo-reveal relative overflow-hidden rounded-keepsake bg-white/72 p-4 shadow-soft ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-keepsake-blush/45 via-white/20 to-keepsake-gold/20" />
      <div className="relative h-full">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
          <FileAudio size={14} aria-hidden="true" />
          Audio {formatDuration(media.duration)}
        </span>
        <Waveform compact={mode === 'preview'} />
        {controls && mode !== 'export' ? <audio className="mt-3 w-full" controls src={media.src} /> : null}
      </div>
    </div>
  );
}
