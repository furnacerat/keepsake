import { describe, expect, it } from 'vitest';
import { templateRegistry } from '../data/templates';
import type { KeepsakeMediaAsset } from '../models/keepsake';
import { generateStorySuggestions } from './StoryEngine';
import { extractStoryMetadata } from './storyMetadata';

const template = templateRegistry[0];
const mediaItems: KeepsakeMediaAsset[] = [
  {
    id: 'photo-1',
    type: 'photo',
    src: 'data:image/png;base64,photo',
    fileName: '2026-05-01@Home.png',
  },
  {
    id: 'video-1',
    type: 'video',
    src: 'data:video/mp4;base64,video',
    duration: 84,
    fileName: '2026-05-02@Home.mp4',
  },
];

describe('StoryEngine', () => {
  it('extracts media metadata for storytelling context', () => {
    const metadata = extractStoryMetadata(mediaItems, template);

    expect(metadata).toMatchObject({
      photoCount: 1,
      videoCount: 1,
      audioCount: 0,
      totalDuration: 84,
      locations: ['Home.png', 'Home.mp4'],
      earliestTimestamp: '2026-05-01',
      latestTimestamp: '2026-05-02',
    });
  });

  it('generates multiple tone-aware suggestions', async () => {
    const suggestions = await generateStorySuggestions({
      animationStyle: 'panAndZoom',
      mediaItems,
      template,
      templateId: template.id,
      tone: 'nostalgic',
      userText: 'This was the day everything felt still.',
    });

    expect(suggestions).toHaveLength(3);
    expect(suggestions[0].tone).toBe('nostalgic');
    expect(suggestions[0].confidence).toBeGreaterThan(0.7);
    expect(suggestions[0].body).toContain('video');
    expect(suggestions[0].body).toContain('pan And Zoom');
  });
});
