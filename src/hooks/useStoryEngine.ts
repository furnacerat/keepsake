import { useCallback, useMemo, useRef, useState } from 'react';
import type { TemplateDefinition } from '../data/templates';
import type { KeepsakeMediaAsset, StorySuggestion, StoryTone } from '../models/keepsake';
import { generateStorySuggestions } from '../services/StoryEngine';
import { extractStoryMetadata } from '../services/storyMetadata';

type GenerateStoryArgs = {
  animationStyle?: string;
  mediaItems: KeepsakeMediaAsset[];
  template: TemplateDefinition;
  templateId: string;
  tone: StoryTone;
  userText?: string;
};

function getCacheKey(args: GenerateStoryArgs) {
  return JSON.stringify({
    media: args.mediaItems.map((item) => [item.id, item.type, item.duration]),
    templateId: args.templateId,
    tone: args.tone,
    userText: args.userText?.trim() ?? '',
    animationStyle: args.animationStyle ?? 'none',
  });
}

export function useStoryEngine() {
  const cacheRef = useRef(new Map<string, StorySuggestion[]>());
  const [suggestions, setSuggestions] = useState<StorySuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>();

  const generate = useCallback(async (args: GenerateStoryArgs, options: { force?: boolean } = {}) => {
    const cacheKey = getCacheKey(args);
    const cached = cacheRef.current.get(cacheKey);
    if (cached && !options.force) {
      setSuggestions(cached);
      return cached;
    }

    setIsGenerating(true);
    setError(undefined);

    try {
      const metadata = extractStoryMetadata(args.mediaItems, args.template);
      const nextSuggestions = await generateStorySuggestions({ ...args, metadata });
      cacheRef.current.set(cacheKey, nextSuggestions);
      setSuggestions(nextSuggestions);
      return nextSuggestions;
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Unable to generate story suggestions.');
      setSuggestions([]);
      return [];
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(undefined);
  }, []);

  return useMemo(
    () => ({
      clear,
      error,
      generate,
      isGenerating,
      regenerate: (args: GenerateStoryArgs) => generate(args, { force: true }),
      suggestions,
    }),
    [clear, error, generate, isGenerating, suggestions],
  );
}
