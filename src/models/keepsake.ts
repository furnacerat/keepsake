import { z } from 'zod';

export type RecipientType = 'Myself' | 'Someone Else';
export type UnlockType = 'none' | 'date';
export type KeepsakeStatus = 'locked' | 'unlocked';
export type KeepsakeMediaType = 'photo' | 'video' | 'audio';
export type MemoryType = 'Photo Memory' | 'Voice Memory' | 'Written Story' | 'Family Legacy';
export type AnimationStyle = 'none' | 'gentleFade' | 'panAndZoom' | 'scrapbookReveal' | 'filmstripScroll';
export type AnimationExportFormat = 'static' | 'mp4' | 'gif' | 'webm';
export type StoryTone = 'warm' | 'nostalgic' | 'playful' | 'romantic' | 'documentary';
export type PrintExportType = 'png' | 'pdf-page' | 'pdf-album';
export type PrintResolution = '1080p' | '4k' | 'print-300' | 'ultra-print-600';
export type PrintSize = '5x7' | '8x10' | '11x14' | '12x12' | 'a4' | 'custom';

export const keepsakeMediaTypeSchema = z.enum(['photo', 'video', 'audio']);
export const memoryTypeSchema = z.enum(['Photo Memory', 'Voice Memory', 'Written Story', 'Family Legacy']);
export const animationStyleSchema = z.enum([
  'none',
  'gentleFade',
  'panAndZoom',
  'scrapbookReveal',
  'filmstripScroll',
]);
export const animationExportFormatSchema = z.enum(['static', 'mp4', 'gif', 'webm']);
export const storyToneSchema = z.enum(['warm', 'nostalgic', 'playful', 'romantic', 'documentary']);
export const printExportTypeSchema = z.enum(['png', 'pdf-page', 'pdf-album']);
export const printResolutionSchema = z.enum(['1080p', '4k', 'print-300', 'ultra-print-600']);
export const printSizeSchema = z.enum(['5x7', '8x10', '11x14', '12x12', 'a4', 'custom']);

export const animationMetadataSchema = z.object({
  duration: z.number().positive(),
  easing: z.enum(['linear', 'easeInOut', 'easeOut']),
  loop: z.boolean(),
  exportFormat: animationExportFormatSchema,
  fps: z.number().int().positive().optional(),
  resolution: z
    .object({
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
});

export type AnimationMetadata = z.infer<typeof animationMetadataSchema>;

export const storySuggestionSchema = z.object({
  title: z.string(),
  body: z.string(),
  tone: storyToneSchema,
  confidence: z.number().min(0).max(1),
});

export type StorySuggestion = z.infer<typeof storySuggestionSchema>;

export const exportSettingsSchema = z.object({
  exportType: printExportTypeSchema,
  resolution: printResolutionSchema,
  colorProfile: z.enum(['srgb', 'cmyk-safe']),
  includeBleed: z.boolean(),
  includeSafeZones: z.boolean(),
  signedUrlExpiresAt: z.string().optional(),
});

export type ExportSettings = z.infer<typeof exportSettingsSchema>;

export const keepsakeMediaAssetSchema = z.object({
  id: z.string(),
  type: keepsakeMediaTypeSchema,
  src: z.string(),
  thumbnailUrl: z.string().optional(),
  duration: z.number().nonnegative().optional(),
  fileName: z.string().optional(),
  qrLinkedContent: z
    .object({
      url: z.string().optional(),
      fileId: z.string().optional(),
      contentType: keepsakeMediaTypeSchema.optional(),
    })
    .optional(),
});

export type KeepsakeMediaAsset = z.infer<typeof keepsakeMediaAssetSchema>;

export type Keepsake = {
  id: string;
  ideaType: string;
  recipientType: RecipientType;
  title: string;
  message: string;
  unlockType: UnlockType;
  unlockDate?: string;
  createdAt: string;
  status: KeepsakeStatus;
  templateId?: string;
  photoIds?: string[];
  body?: string;
  backgroundStyle?: string;
  mediaType?: KeepsakeMediaType;
  mediaIds?: string[];
  mediaItems?: KeepsakeMediaAsset[];
  thumbnailUrl?: string;
  duration?: number;
  showPlaybackControls?: boolean;
  animationStyle?: AnimationStyle;
  animationMetadata?: AnimationMetadata;
  qrCodeId?: string;
  storySuggestions?: StorySuggestion[];
  exportSettings?: ExportSettings;
  printSize?: PrintSize;
  dpi?: number;
  linkedNodeIds?: string[];
  primaryEventId?: string;
  primaryPersonIds?: string[];
  primaryPlaceId?: string;
  memoryType?: MemoryType;
  person?: string;
  memoryDate?: string;
  approximateTimePeriod?: string;
  photoPlaceholder?: boolean;
  voicePlaceholder?: boolean;
};

export const keepsakeSchema = z.object({
  id: z.string(),
  ideaType: z.string(),
  recipientType: z.enum(['Myself', 'Someone Else']),
  title: z.string(),
  message: z.string(),
  unlockType: z.enum(['none', 'date']),
  unlockDate: z.string().optional(),
  createdAt: z.string(),
  status: z.enum(['locked', 'unlocked']),
  templateId: z.string().optional(),
  photoIds: z.array(z.string()).optional(),
  body: z.string().optional(),
  backgroundStyle: z.string().optional(),
  mediaType: keepsakeMediaTypeSchema.optional(),
  mediaIds: z.array(z.string()).optional(),
  mediaItems: z.array(keepsakeMediaAssetSchema).optional(),
  thumbnailUrl: z.string().optional(),
  duration: z.number().nonnegative().optional(),
  showPlaybackControls: z.boolean().optional(),
  animationStyle: animationStyleSchema.optional(),
  animationMetadata: animationMetadataSchema.optional(),
  qrCodeId: z.string().optional(),
  storySuggestions: z.array(storySuggestionSchema).optional(),
  exportSettings: exportSettingsSchema.optional(),
  printSize: printSizeSchema.optional(),
  dpi: z.number().int().positive().optional(),
  linkedNodeIds: z.array(z.string()).optional(),
  primaryEventId: z.string().optional(),
  primaryPersonIds: z.array(z.string()).optional(),
  primaryPlaceId: z.string().optional(),
  memoryType: memoryTypeSchema.optional(),
  person: z.string().optional(),
  memoryDate: z.string().optional(),
  approximateTimePeriod: z.string().optional(),
  photoPlaceholder: z.boolean().optional(),
  voicePlaceholder: z.boolean().optional(),
});

export type CreateKeepsakeInput = Omit<Keepsake, 'id' | 'createdAt' | 'status'>;
export type UpdateKeepsakeInput = Partial<Omit<Keepsake, 'id'>>;
