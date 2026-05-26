import { describe, expect, it } from 'vitest';
import { exportAnimatedKeepsake } from './animatedExportService';
import { easeProgress, getDefaultAnimationMetadata } from '../hooks/useAnimationEngine';

describe('animation engine presets', () => {
  it('creates template-aware defaults for animated keepsakes', () => {
    const metadata = getDefaultAnimationMetadata('filmstripScroll', 'webm');

    expect(metadata).toMatchObject({
      duration: 12,
      easing: 'linear',
      loop: true,
      exportFormat: 'webm',
      fps: 30,
    });
  });

  it('eases animation timing predictably', () => {
    expect(easeProgress(0, 'easeInOut')).toBe(0);
    expect(easeProgress(1, 'easeOut')).toBe(1);
    expect(easeProgress(0.5, 'linear')).toBe(0.5);
  });
});

describe('animated export pipeline', () => {
  it('returns a typed mock export artifact for GIF/WebM/MP4 contracts', async () => {
    const metadata = getDefaultAnimationMetadata('scrapbookReveal', 'gif');
    const result = await exportAnimatedKeepsake({
      animationStyle: 'scrapbookReveal',
      metadata,
      title: 'Graduation Memory',
    });

    expect(result.fileName).toBe('graduation-memory.gif');
    expect(result.mimeType).toBe('image/gif');
    expect(result.animationStyle).toBe('scrapbookReveal');
  });
});
