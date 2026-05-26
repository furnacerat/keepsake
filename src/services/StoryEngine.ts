import type { TemplateDefinition } from '../data/templates';
import type { KeepsakeMediaAsset, StorySuggestion, StoryTone } from '../models/keepsake';
import { extractStoryMetadata } from './storyMetadata';

export type StoryEngineInput = {
  mediaItems: KeepsakeMediaAsset[];
  metadata?: ReturnType<typeof extractStoryMetadata>;
  template: TemplateDefinition;
  templateId: string;
  tone: StoryTone;
  userText?: string;
  animationStyle?: string;
};

const toneOpeners: Record<StoryTone, string> = {
  warm: 'A tender collection of moments',
  nostalgic: 'A memory with the softness of looking back',
  playful: 'A bright little story full of motion',
  romantic: 'A keepsake about closeness, care, and the details that linger',
  documentary: 'A clear record of a meaningful moment',
};

const toneVerbs: Record<StoryTone, string> = {
  warm: 'holds',
  nostalgic: 'remembers',
  playful: 'celebrates',
  romantic: 'honors',
  documentary: 'documents',
};

function formatDuration(seconds: number) {
  if (!seconds) {
    return '';
  }

  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

function buildContextLine(input: StoryEngineInput) {
  const metadata = input.metadata ?? extractStoryMetadata(input.mediaItems, input.template);
  const pieces = [
    metadata.photoCount ? `${metadata.photoCount} photo${metadata.photoCount === 1 ? '' : 's'}` : '',
    metadata.videoCount ? `${metadata.videoCount} video${metadata.videoCount === 1 ? '' : 's'}` : '',
    metadata.audioCount ? `${metadata.audioCount} audio clip${metadata.audioCount === 1 ? '' : 's'}` : '',
    metadata.locations.length ? `from ${metadata.locations.join(', ')}` : '',
    metadata.totalDuration ? `with ${formatDuration(metadata.totalDuration)} of media` : '',
  ].filter(Boolean);

  return pieces.length ? pieces.join(', ') : `a ${metadata.templateCategory} page`;
}

function buildMemoryModeLine(input: StoryEngineInput) {
  const metadata = input.metadata ?? extractStoryMetadata(input.mediaItems, input.template);

  if (metadata.photoCount > 1) {
    const dateRange =
      metadata.earliestTimestamp && metadata.latestTimestamp && metadata.earliestTimestamp !== metadata.latestTimestamp
        ? ` from ${metadata.earliestTimestamp} to ${metadata.latestTimestamp}`
        : '';
    return `Arranged as a chronological memory${dateRange}, it lets the story unfold one image at a time.`;
  }

  if (metadata.videoCount > 0) {
    return 'The video becomes the emotional highlight: a moving piece of the memory that can open the story before the still details settle in.';
  }

  if (metadata.audioCount > 0) {
    return 'The audio gives the page a voice, turning the keepsake into something that can be heard as well as read.';
  }

  return 'The page leaves room for a simple message and a feeling worth keeping.';
}

function buildAnimationLine(input: StoryEngineInput) {
  if (!input.animationStyle || input.animationStyle === 'none') {
    return '';
  }

  return `For the animated version, open with a short intro line and let the closing words linger as the ${input.animationStyle.replace(
    /([A-Z])/g,
    ' $1',
  )} motion resolves.`;
}

function confidenceFor(input: StoryEngineInput, variant: number) {
  const metadata = input.metadata ?? extractStoryMetadata(input.mediaItems, input.template);
  const mediaSignal = Math.min(0.18, metadata.media.length * 0.03);
  const textSignal = input.userText?.trim() ? 0.08 : 0;
  return Number(Math.min(0.96, 0.72 + mediaSignal + textSignal - variant * 0.03).toFixed(2));
}

export async function generateStorySuggestions(input: StoryEngineInput): Promise<StorySuggestion[]> {
  const metadata = input.metadata ?? extractStoryMetadata(input.mediaItems, input.template);
  const contextLine = buildContextLine({ ...input, metadata });
  const memoryLine = buildMemoryModeLine({ ...input, metadata });
  const animationLine = buildAnimationLine(input);
  const userLine = input.userText?.trim() ? `It keeps the user's words close: "${input.userText.trim().slice(0, 120)}."` : '';
  const opener = toneOpeners[input.tone];
  const verb = toneVerbs[input.tone];
  const templatePhrase = input.template.name.toLowerCase();

  return [
    {
      title: metadata.locations[0] ? `${input.template.name} in ${metadata.locations[0]}` : `${input.template.name} Memory`,
      body: `${opener}, this ${templatePhrase} ${verb} ${contextLine}. ${memoryLine} ${userLine} ${animationLine}`.replace(/\s+/g, ' ').trim(),
      tone: input.tone,
      confidence: confidenceFor(input, 0),
    },
    {
      title: metadata.photoCount > 1 ? 'A Story in Little Pieces' : 'The Moment We Kept',
      body: `${opener} shaped for ${input.template.category} pages. Use this as a gentle caption-led narrative: begin with what is visible, name why it mattered, and close with the feeling that should stay. ${memoryLine}`,
      tone: input.tone,
      confidence: confidenceFor(input, 1),
    },
    {
      title: input.tone === 'documentary' ? 'What Happened Here' : 'Worth Remembering',
      body: `${contextLine} becomes the foundation for this keepsake. ${metadata.videoCount ? 'Lead with the video highlight, then add a reflective caption.' : ''} ${metadata.audioCount ? 'Let the audio serve as the living note behind the page.' : ''} ${animationLine}`.replace(/\s+/g, ' ').trim(),
      tone: input.tone,
      confidence: confidenceFor(input, 2),
    },
  ];
}
