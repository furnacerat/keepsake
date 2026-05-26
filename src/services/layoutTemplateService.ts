import type { BookLayout, BookPageType, BookTheme } from '../models/book';

const palettes: Record<BookTheme, string[]> = {
  'babys-first-year': ['#FFF7ED', '#F7DCD6', '#C99C5F', '#80957A'],
  wedding: ['#FFF7ED', '#F4E7DD', '#B96E6F', '#362622'],
  graduation: ['#FFF7ED', '#E8E0D4', '#80957A', '#362622'],
  memorial: ['#F8F4ED', '#E2D8CC', '#80957A', '#56342F'],
  travel: ['#FFF4D9', '#DDE9D3', '#C99C5F', '#56342F'],
  'family-history': ['#F7E8D8', '#FFF7ED', '#B96E6F', '#362622'],
};

export const predefinedLayouts: Record<BookPageType, Omit<BookLayout, 'colorPalette' | 'typographySet'>> = {
  photo: {
    id: 'full-bleed-photo',
    name: 'Full-Bleed Photo',
    columns: 1,
    density: 'low',
    padding: 24,
    margin: 18,
    background: 'warm-linen',
    frames: ['soft-shadow'],
    stickers: [],
    decorativeElements: ['date-stamp'],
  },
  collage: {
    id: 'soft-collage-grid',
    name: 'Soft Collage Grid',
    columns: 3,
    density: 'high',
    padding: 18,
    margin: 16,
    background: 'cream-paper',
    frames: ['rounded-photo', 'polaroid'],
    stickers: ['pressed-flower'],
    decorativeElements: ['caption-strip'],
  },
  story: {
    id: 'story-page',
    name: 'Story Page',
    columns: 1,
    density: 'medium',
    padding: 32,
    margin: 22,
    background: 'rose-wash',
    frames: [],
    stickers: [],
    decorativeElements: ['pull-quote'],
  },
  letter: {
    id: 'letter-keepsake',
    name: 'Letter Keepsake',
    columns: 1,
    density: 'low',
    padding: 36,
    margin: 24,
    background: 'linen-letter',
    frames: ['paper-edge'],
    stickers: [],
    decorativeElements: ['signature-line'],
  },
  timeline: {
    id: 'timeline-ribbon',
    name: 'Timeline Ribbon',
    columns: 2,
    density: 'medium',
    padding: 22,
    margin: 18,
    background: 'warm-linen',
    frames: ['thin-border'],
    stickers: [],
    decorativeElements: ['timeline-line'],
  },
  'memory-map': {
    id: 'memory-map',
    name: 'Memory Map',
    columns: 2,
    density: 'medium',
    padding: 22,
    margin: 18,
    background: 'sage-paper',
    frames: ['map-pin'],
    stickers: ['compass'],
    decorativeElements: ['location-label'],
  },
  'qr-linked': {
    id: 'qr-memory-page',
    name: 'QR Memory Page',
    columns: 1,
    density: 'low',
    padding: 28,
    margin: 18,
    background: 'golden-hour',
    frames: ['media-frame'],
    stickers: ['play-badge'],
    decorativeElements: ['qr-safe-zone'],
  },
  mixed: {
    id: 'mixed-media-story',
    name: 'Mixed Media Story',
    columns: 2,
    density: 'medium',
    padding: 20,
    margin: 16,
    background: 'cream-paper',
    frames: ['rounded-photo', 'video-frame'],
    stickers: ['spark'],
    decorativeElements: ['caption-strip', 'qr-safe-zone'],
  },
};

export function getLayout(pageType: BookPageType, theme: BookTheme, suggestedColumns?: number): BookLayout {
  const base = predefinedLayouts[pageType];

  return {
    ...base,
    columns: suggestedColumns ?? base.columns,
    colorPalette: palettes[theme],
    typographySet: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
  };
}

export function suggestPageType(mediaCount: number, hasStory: boolean, hasQrMedia: boolean): BookPageType {
  if (hasQrMedia) {
    return mediaCount > 1 ? 'mixed' : 'qr-linked';
  }

  if (hasStory && mediaCount === 0) {
    return 'story';
  }

  if (mediaCount >= 3) {
    return 'collage';
  }

  return mediaCount === 1 ? 'photo' : 'timeline';
}
