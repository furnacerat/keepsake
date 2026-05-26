import type { AnimationExportFormat, AnimationMetadata, AnimationStyle } from '../models/keepsake';

export type AnimatedExportResult = {
  id: string;
  fileName: string;
  format: AnimationExportFormat;
  mimeType: string;
  blob: Blob;
  animationStyle: AnimationStyle;
  metadata: AnimationMetadata;
};

const mimeTypes: Record<AnimationExportFormat, string> = {
  static: 'image/png',
  mp4: 'video/mp4',
  gif: 'image/gif',
  webm: 'video/webm',
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function exportAnimatedKeepsake({
  animationStyle,
  metadata,
  title,
}: {
  animationStyle: AnimationStyle;
  metadata: AnimationMetadata;
  title: string;
}): Promise<AnimatedExportResult> {
  const format = metadata.exportFormat;
  const payload = {
    title,
    animationStyle,
    duration: metadata.duration,
    easing: metadata.easing,
    loop: metadata.loop,
    fps: metadata.fps,
    resolution: metadata.resolution,
    note:
      format === 'mp4' || format === 'gif'
        ? 'Mock export artifact. Add a production encoder such as FFmpeg WASM for real MP4/GIF rendering.'
        : 'Browser-ready animated keepsake export contract.',
  };

  return {
    id: createId(),
    fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'keepsake-animation'}.${format === 'static' ? 'png' : format}`,
    format,
    mimeType: mimeTypes[format],
    blob: new Blob([JSON.stringify(payload, null, 2)], { type: mimeTypes[format] }),
    animationStyle,
    metadata,
  };
}
