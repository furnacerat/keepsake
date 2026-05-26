import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { AnimationMetadata, AnimationStyle } from '../models/keepsake';
import type { TemplateRenderData } from './TemplateEngine';
import { useAnimationEngine } from '../hooks/useAnimationEngine';

type AnimatedKeepsakeRendererProps = {
  animationMetadata?: AnimationMetadata;
  animationStyle: AnimationStyle;
  className?: string;
  data: TemplateRenderData;
  showControls?: boolean;
  templateId: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement | undefined>((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(undefined);
    image.src = src;
  });
}

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  scale = 1,
  panX = 0,
  panY = 0,
) {
  const sourceRatio = image.width / image.height;
  const targetRatio = width / height;
  const sourceWidth = sourceRatio > targetRatio ? image.height * targetRatio : image.width;
  const sourceHeight = sourceRatio > targetRatio ? image.height : image.width / targetRatio;
  const sx = (image.width - sourceWidth) / 2 + panX;
  const sy = (image.height - sourceHeight) / 2 + panY;

  context.save();
  drawRoundedRect(context, x, y, width, height, 28);
  context.clip();
  context.translate(x + width / 2, y + height / 2);
  context.scale(scale, scale);
  context.drawImage(image, sx, sy, sourceWidth, sourceHeight, -width / 2, -height / 2, width, height);
  context.restore();
}

function drawWaveform(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, progress: number) {
  const bars = 32;
  const gap = width / bars;
  context.fillStyle = 'rgba(0, 166, 166, 0.72)';
  for (let index = 0; index < bars; index += 1) {
    const barHeight = height * (0.24 + (((index * 19) % 68) / 100));
    const reveal = index / bars < progress ? 1 : 0.3;
    context.globalAlpha = reveal;
    drawRoundedRect(context, x + index * gap, y + (height - barHeight) / 2, Math.max(4, gap * 0.42), barHeight, 6);
    context.fill();
  }
  context.globalAlpha = 1;
}

function getMediaImageSources(data: TemplateRenderData) {
  const mediaSources =
    data.media
      ?.map((item) => item.thumbnailUrl ?? (item.type === 'photo' ? item.src : undefined))
      .filter((src): src is string => Boolean(src)) ?? [];
  const photoSources = data.photos.map((photo) => photo.src);
  return Array.from(new Set([...mediaSources, ...photoSources]));
}

export function AnimatedKeepsakeRenderer({
  animationMetadata,
  animationStyle,
  className = '',
  data,
  showControls = true,
  templateId,
}: AnimatedKeepsakeRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<HTMLImageElement[]>([]);
  const engine = useAnimationEngine({ animationStyle, metadata: animationMetadata });

  useEffect(() => {
    let cancelled = false;
    const sources = getMediaImageSources(data);
    void Promise.all(sources.map((src) => loadImage(src))).then((images) => {
      if (!cancelled) {
        imageCacheRef.current = images.filter((image): image is HTMLImageElement => Boolean(image));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const images = imageCacheRef.current;
    const progress = animationStyle === 'none' ? 1 : engine.frame.easedProgress;

    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FDF7E3');
    gradient.addColorStop(0.55, '#F5E8E4');
    gradient.addColorStop(1, '#E8F0E8');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = 'rgba(255,255,255,0.62)';
    drawRoundedRect(context, 48, 42, width - 96, height - 84, 34);
    context.fill();

    const title = data.title || 'Keepsake';
    context.fillStyle = '#352A2A';
    context.font = '700 62px Georgia, serif';
    context.fillText(title.slice(0, 34), 84, 120);

    context.fillStyle = '#6B6B6B';
    context.font = '600 24px Inter, sans-serif';
    context.fillText(templateId.replace(/-/g, ' '), 86, 162);

    if (animationStyle === 'filmstripScroll') {
      const stripY = 210;
      const frameWidth = 280;
      const offset = -((engine.frame.progress * (frameWidth + 28) * Math.max(images.length, 1)) % (frameWidth + 28));
      for (let index = 0; index < Math.max(images.length, 4); index += 1) {
        const image = images[index % Math.max(images.length, 1)];
        const x = 70 + index * (frameWidth + 28) + offset;
        context.fillStyle = '#2A2424';
        drawRoundedRect(context, x - 12, stripY - 18, frameWidth + 24, 242, 20);
        context.fill();
        if (image) {
          drawCoverImage(context, image, x, stripY, frameWidth, 206);
        }
      }
    } else if (animationStyle === 'scrapbookReveal') {
      images.slice(0, 4).forEach((image, index) => {
        const delay = index * 0.16;
        const local = Math.max(0, Math.min(1, (progress - delay) / 0.42));
        const x = 86 + (index % 2) * 370;
        const y = 214 + Math.floor(index / 2) * 230;
        context.save();
        context.globalAlpha = local;
        context.translate(x + 140, y + 100);
        context.rotate((index % 2 ? 1 : -1) * 0.04 * local);
        context.translate(-x - 140, -y - 100);
        drawCoverImage(context, image, x, y + (1 - local) * 36, 320, 205);
        context.fillStyle = 'rgba(224,164,88,0.72)';
        drawRoundedRect(context, x + 94, y - 8 + (1 - local) * 36, 130, 26, 8);
        context.fill();
        context.restore();
      });
    } else {
      const image = images[Math.min(images.length - 1, Math.floor(engine.frame.progress * Math.max(images.length, 1)))];
      if (image) {
        const scale = animationStyle === 'panAndZoom' ? 1 + progress * 0.08 : 1;
        const alpha = animationStyle === 'gentleFade' ? 0.35 + progress * 0.65 : 1;
        context.globalAlpha = alpha;
        drawCoverImage(context, image, 84, 200, width - 168, 390, scale, progress * 16, progress * 8);
        context.globalAlpha = 1;
      }
    }

    if (data.media?.some((item) => item.type === 'audio')) {
      drawWaveform(context, 100, height - 130, width - 200, 64, engine.frame.progress);
    }

    context.fillStyle = '#6B6B6B';
    context.font = '500 25px Inter, sans-serif';
    const body = data.body || 'Animated memory preview';
    context.fillText(body.slice(0, 70), 86, height - 58);
  }, [animationStyle, data, engine.frame, templateId]);

  return (
    <div className={`overflow-hidden rounded-keepsake bg-white/80 shadow-soft ${className}`}>
      <canvas
        className="aspect-video w-full bg-keepsake-cream"
        height={720}
        ref={canvasRef}
        width={1280}
        aria-label={`${animationStyle} animated keepsake preview`}
      />
      {showControls ? (
        <div className="flex items-center justify-between gap-3 border-t border-keepsake-roseDeep/10 bg-white/75 px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-muted">
            {animationStyle.replace(/([A-Z])/g, ' $1')}
          </p>
          <div className="flex gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-keepsake-blush text-keepsake-accentStrong" type="button" onClick={engine.isPlaying ? engine.pause : engine.play} aria-label={engine.isPlaying ? 'Pause animation' : 'Play animation'}>
              {engine.isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full bg-keepsake-blush text-keepsake-accentStrong" type="button" onClick={engine.restart} aria-label="Restart animation">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
