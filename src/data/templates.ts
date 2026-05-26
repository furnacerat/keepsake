export type TemplateCategory = 'keepsake' | 'scrapbook' | 'letter' | 'album';
export type TemplateOrientation = 'portrait' | 'landscape';
export type TemplateMediaKind = 'photo' | 'video' | 'audio' | 'mixed';

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  supportedPhotoCount: number[];
  supportedMediaTypes?: TemplateMediaKind[];
  orientation: TemplateOrientation;
  category: TemplateCategory;
  requiresPro?: boolean;
};

export const templateRegistry: TemplateDefinition[] = [
  {
    id: 'simple-story',
    name: 'Simple Story',
    description: 'A warm title, one image, and space for a memory note.',
    supportedPhotoCount: [1],
    supportedMediaTypes: ['photo'],
    orientation: 'portrait',
    category: 'keepsake',
  },
  {
    id: 'polaroid-memories',
    name: 'Polaroid Memories',
    description: 'Stacked instant-photo frames with handwritten-feeling captions.',
    supportedPhotoCount: [1, 2, 3],
    supportedMediaTypes: ['photo'],
    orientation: 'portrait',
    category: 'scrapbook',
  },
  {
    id: 'two-photo-spread',
    name: 'Two-Photo Spread',
    description: 'A balanced two-photo page with a quiet story panel.',
    supportedPhotoCount: [2],
    supportedMediaTypes: ['photo'],
    orientation: 'landscape',
    category: 'album',
  },
  {
    id: 'three-photo-grid',
    name: 'Three-Photo Grid',
    description: 'Three moments grouped into one clean memory page.',
    supportedPhotoCount: [3],
    supportedMediaTypes: ['photo'],
    orientation: 'portrait',
    category: 'scrapbook',
  },
  {
    id: 'full-page-photo',
    name: 'Full-Page Photo',
    description: 'A single photo takes the stage with minimal text.',
    supportedPhotoCount: [1],
    supportedMediaTypes: ['photo'],
    orientation: 'portrait',
    category: 'album',
  },
  {
    id: 'letter-page',
    name: 'Letter Page',
    description: 'A print-ready letter layout with optional image accent.',
    supportedPhotoCount: [0, 1],
    supportedMediaTypes: ['photo'],
    orientation: 'portrait',
    category: 'letter',
  },
  {
    id: 'scrapbook-collage',
    name: 'Scrapbook Collage',
    description: 'A playful collage for groups of favorite photos.',
    supportedPhotoCount: [3, 4, 5, 6],
    supportedMediaTypes: ['photo'],
    orientation: 'landscape',
    category: 'scrapbook',
    requiresPro: true,
  },
  {
    id: 'event-highlight-page',
    name: 'Event Highlight Page',
    description: 'A title-forward page for birthdays, trips, and milestones.',
    supportedPhotoCount: [1, 2, 3, 4],
    supportedMediaTypes: ['photo'],
    orientation: 'portrait',
    category: 'scrapbook',
  },
  {
    id: 'video-memory-page',
    name: 'Video Memory Page',
    description: 'A single video still, playback-ready memory caption, and QR placeholder.',
    supportedPhotoCount: [0],
    supportedMediaTypes: ['video'],
    orientation: 'portrait',
    category: 'keepsake',
    requiresPro: true,
  },
  {
    id: 'audio-story-page',
    name: 'Audio Story Page',
    description: 'A warm audio waveform page with title, body text, and background.',
    supportedPhotoCount: [0],
    supportedMediaTypes: ['audio'],
    orientation: 'portrait',
    category: 'letter',
  },
  {
    id: 'mixed-media-collage',
    name: 'Mixed Media Collage',
    description: 'A designed composition for one photo, one video, and a short story.',
    supportedPhotoCount: [1],
    supportedMediaTypes: ['mixed'],
    orientation: 'portrait',
    category: 'scrapbook',
    requiresPro: true,
  },
];

export const backgroundStyles = [
  { id: 'warm', label: 'Warm Linen', className: 'from-keepsake-cream via-white to-keepsake-blush' },
  { id: 'rose', label: 'Rose Wash', className: 'from-keepsake-blush via-white to-[#F7DCD6]' },
  { id: 'sage', label: 'Sage Paper', className: 'from-[#EEF4E9] via-white to-keepsake-parchment' },
  { id: 'gold', label: 'Golden Hour', className: 'from-[#FFF4D9] via-white to-keepsake-parchment' },
];

export function getTemplate(templateId: string) {
  return templateRegistry.find((template) => template.id === templateId) ?? templateRegistry[0];
}

export function getBackgroundClass(backgroundStyle: string) {
  return backgroundStyles.find((style) => style.id === backgroundStyle)?.className ?? backgroundStyles[0].className;
}
