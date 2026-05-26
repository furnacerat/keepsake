import { useEffect, useMemo, useRef, useState } from 'react';
import type { AnimationMetadata, AnimationStyle } from '../models/keepsake';

export type AnimationFrameState = {
  elapsed: number;
  progress: number;
  easedProgress: number;
  loopIteration: number;
};

const defaultDurations: Record<AnimationStyle, number> = {
  none: 4,
  gentleFade: 8,
  panAndZoom: 10,
  scrapbookReveal: 7,
  filmstripScroll: 12,
};

export function getDefaultAnimationMetadata(
  animationStyle: AnimationStyle,
  exportFormat: AnimationMetadata['exportFormat'] = 'webm',
): AnimationMetadata {
  return {
    duration: defaultDurations[animationStyle],
    easing: animationStyle === 'filmstripScroll' ? 'linear' : 'easeInOut',
    loop: animationStyle !== 'none',
    exportFormat,
    fps: 30,
    resolution: {
      width: 1280,
      height: 720,
    },
  };
}

export function easeProgress(progress: number, easing: AnimationMetadata['easing']) {
  if (easing === 'linear') {
    return progress;
  }

  if (easing === 'easeOut') {
    return 1 - Math.pow(1 - progress, 3);
  }

  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function useAnimationEngine({
  animationStyle,
  autoPlay = true,
  metadata,
}: {
  animationStyle: AnimationStyle;
  autoPlay?: boolean;
  metadata?: AnimationMetadata;
}) {
  const resolvedMetadata = useMemo(
    () => metadata ?? getDefaultAnimationMetadata(animationStyle),
    [animationStyle, metadata],
  );
  const [isPlaying, setIsPlaying] = useState(autoPlay && animationStyle !== 'none');
  const [frame, setFrame] = useState<AnimationFrameState>({
    elapsed: 0,
    progress: 0,
    easedProgress: 0,
    loopIteration: 0,
  });
  const startedAtRef = useRef<number | undefined>(undefined);
  const pausedElapsedRef = useRef(0);

  useEffect(() => {
    setIsPlaying(autoPlay && animationStyle !== 'none');
    setFrame({ elapsed: 0, progress: 0, easedProgress: 0, loopIteration: 0 });
    startedAtRef.current = undefined;
    pausedElapsedRef.current = 0;
  }, [animationStyle, autoPlay]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let animationFrame = 0;
    const durationMs = resolvedMetadata.duration * 1000;

    function tick(now: number) {
      if (!startedAtRef.current) {
        startedAtRef.current = now - pausedElapsedRef.current;
      }

      const rawElapsed = now - startedAtRef.current;
      const loopIteration = Math.floor(rawElapsed / durationMs);
      const elapsed = resolvedMetadata.loop ? rawElapsed % durationMs : Math.min(rawElapsed, durationMs);
      const progress = durationMs > 0 ? elapsed / durationMs : 1;
      setFrame({
        elapsed: elapsed / 1000,
        progress,
        easedProgress: easeProgress(progress, resolvedMetadata.easing),
        loopIteration,
      });

      if (resolvedMetadata.loop || rawElapsed < durationMs) {
        animationFrame = window.requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    }

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isPlaying, resolvedMetadata]);

  return {
    frame,
    isPlaying,
    metadata: resolvedMetadata,
    pause: () => {
      pausedElapsedRef.current = frame.elapsed * 1000;
      startedAtRef.current = undefined;
      setIsPlaying(false);
    },
    play: () => setIsPlaying(animationStyle !== 'none'),
    restart: () => {
      pausedElapsedRef.current = 0;
      startedAtRef.current = undefined;
      setFrame({ elapsed: 0, progress: 0, easedProgress: 0, loopIteration: 0 });
      setIsPlaying(animationStyle !== 'none');
    },
  };
}
