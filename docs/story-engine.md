# AI-Assisted Storytelling Engine

Keepsake now includes a local, AI-ready storytelling layer. It is deterministic for now, but the hook and service contracts are shaped so a real model endpoint can replace the generator later.

## Core Files

- `src/services/StoryEngine.ts`
- `src/services/storyMetadata.ts`
- `src/hooks/useStoryEngine.ts`

## Inputs

The story engine accepts:

```ts
{
  mediaItems,
  metadata,
  template,
  templateId,
  tone,
  userText,
  animationStyle
}
```

Supported tones:
- `warm`
- `nostalgic`
- `playful`
- `romantic`
- `documentary`

## Outputs

The engine returns `StorySuggestion[]`:

```ts
{
  title: string,
  body: string,
  tone: StoryTone,
  confidence: number
}
```

Suggestions are saved on keepsakes as `storySuggestions`.

## Metadata Extraction

`storyMetadata.ts` extracts:
- Photo count
- Video count and duration
- Audio count and duration
- Timestamp hints from filenames such as `2026-05-01`
- Location hints from filenames containing `@`
- Template category and template name

## Editor Flow

`TemplateEditorScreen` now supports:
- Tone selector
- Generate Story
- Multiple story suggestions
- Accept and edit suggestions
- Smart Autofill for initial title/body
- Memory Mode behavior for multi-photo, video, and audio keepsakes
- Animation-aware intro/outro guidance for Phase 7 animated keepsakes

## Future AI Integration

Replace `generateStorySuggestions` with a backend call while keeping `useStoryEngine` and `StorySuggestion` unchanged. That keeps the editor UI stable while moving generation server-side.
