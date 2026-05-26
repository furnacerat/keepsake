import type { KeepsakeMediaAsset } from '../models/keepsake';
import type { TemplateDefinition } from '../data/templates';

export type StoryMediaMetadata = {
  id: string;
  type: KeepsakeMediaAsset['type'];
  timestamp?: string;
  location?: string;
  duration?: number;
  fileName?: string;
};

export type StoryContextMetadata = {
  media: StoryMediaMetadata[];
  photoCount: number;
  videoCount: number;
  audioCount: number;
  totalDuration: number;
  locations: string[];
  earliestTimestamp?: string;
  latestTimestamp?: string;
  templateCategory: TemplateDefinition['category'];
  templateName: string;
};

function readLocation(media: KeepsakeMediaAsset) {
  if (!media.fileName?.includes('@')) {
    return undefined;
  }

  const parts = media.fileName.split('@');
  return parts[parts.length - 1]?.trim();
}

function readTimestamp(media: KeepsakeMediaAsset) {
  const match = media.fileName?.match(/(20\d{2}[-_]\d{2}[-_]\d{2})/);
  return match?.[1]?.replace(/_/g, '-');
}

export function extractStoryMetadata(mediaItems: KeepsakeMediaAsset[], template: TemplateDefinition): StoryContextMetadata {
  const media = mediaItems.map((item) => ({
    id: item.id,
    type: item.type,
    timestamp: readTimestamp(item),
    location: readLocation(item),
    duration: item.duration,
    fileName: item.fileName,
  }));
  const timestamps = media.map((item) => item.timestamp).filter((value): value is string => Boolean(value)).sort();
  const locations = Array.from(new Set(media.map((item) => item.location).filter((value): value is string => Boolean(value))));

  return {
    media,
    photoCount: media.filter((item) => item.type === 'photo').length,
    videoCount: media.filter((item) => item.type === 'video').length,
    audioCount: media.filter((item) => item.type === 'audio').length,
    totalDuration: media.reduce((total, item) => total + (item.duration ?? 0), 0),
    locations,
    earliestTimestamp: timestamps[0],
    latestTimestamp: timestamps[timestamps.length - 1],
    templateCategory: template.category,
    templateName: template.name,
  };
}
