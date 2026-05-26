import { z } from 'zod';
import { animationMetadataSchema, animationStyleSchema, keepsakeMediaAssetSchema } from './keepsake';

export const bookThemeSchema = z.enum([
  'babys-first-year',
  'wedding',
  'graduation',
  'memorial',
  'travel',
  'family-history',
]);

export const bookKindSchema = z.enum(['scrapbook', 'photo-album']);
export const bookPageTypeSchema = z.enum([
  'photo',
  'collage',
  'story',
  'letter',
  'timeline',
  'memory-map',
  'qr-linked',
  'mixed',
]);

export const bookLayoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  columns: z.number().int().min(1).max(6),
  density: z.enum(['low', 'medium', 'high']),
  padding: z.number().nonnegative(),
  margin: z.number().nonnegative(),
  background: z.string(),
  frames: z.array(z.string()),
  stickers: z.array(z.string()),
  decorativeElements: z.array(z.string()),
  colorPalette: z.array(z.string()),
  typographySet: z.object({
    heading: z.string(),
    body: z.string(),
  }),
});

export const qrSecuritySchema = z.enum(['public', 'private-pin', 'unlisted', 'family-only']);

export const qrCodeSchema = z.object({
  id: z.string(),
  url: z.string(),
  security: qrSecuritySchema,
  pin: z.string().optional(),
  contentType: z.enum(['video', 'audio', 'letter', 'story', 'gallery', 'moment']),
  contentIds: z.array(z.string()),
  title: z.string(),
  animationStyle: animationStyleSchema.optional(),
  animationMetadata: animationMetadataSchema.optional(),
  keepsakeId: z.string().optional(),
});

export const bookTextBlockSchema = z.object({
  id: z.string(),
  role: z.enum(['title', 'caption', 'body', 'quote', 'ai-summary']),
  value: z.string(),
});

export const bookPageSchema = z.object({
  id: z.string(),
  type: bookPageTypeSchema,
  layout: bookLayoutSchema,
  media: z.array(keepsakeMediaAssetSchema),
  text: z.array(bookTextBlockSchema),
  qrCode: qrCodeSchema.optional(),
  theme: bookThemeSchema,
  editable: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});

export const bookSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: bookKindSchema,
  theme: bookThemeSchema,
  pages: z.array(bookPageSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  printSettings: z.object({
    bleedInches: z.number(),
    trimSize: z.string(),
    safeZoneInches: z.number(),
    colorMode: z.enum(['rgb-preview', 'cmyk-print']),
    fontEmbedding: z.boolean(),
  }),
});

export type BookTheme = z.infer<typeof bookThemeSchema>;
export type BookKind = z.infer<typeof bookKindSchema>;
export type BookPageType = z.infer<typeof bookPageTypeSchema>;
export type BookLayout = z.infer<typeof bookLayoutSchema>;
export type BookTextBlock = z.infer<typeof bookTextBlockSchema>;
export type BookPage = z.infer<typeof bookPageSchema>;
export type Book = z.infer<typeof bookSchema>;
export type QrSecurity = z.infer<typeof qrSecuritySchema>;
export type QrCodeRecord = z.infer<typeof qrCodeSchema>;

export type BookGenerationInput = {
  title: string;
  kind: BookKind;
  theme: BookTheme;
  media: z.infer<typeof keepsakeMediaAssetSchema>[];
  letters?: string[];
  stories?: string[];
  aiSummary?: string;
};
