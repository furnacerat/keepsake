# Animated Keepsakes

Phase 7 adds canvas-rendered animated keepsakes for the Pages Come To Life system.

## Model Fields

`src/models/keepsake.ts` includes:

```ts
animationStyle: "none" | "gentleFade" | "panAndZoom" | "scrapbookReveal" | "filmstripScroll"
animationMetadata: {
  duration: number,
  easing: "linear" | "easeInOut" | "easeOut",
  loop: boolean,
  exportFormat: "static" | "mp4" | "gif" | "webm",
  fps?: number,
  resolution?: { width: number, height: number }
}
qrCodeId?: string
```

## Renderer

`AnimatedKeepsakeRenderer.tsx` renders a canvas preview using `templateId`, `TemplateRenderData`, and `animationStyle`.

Presets:
- Gentle Fade: soft fade-in/crossfade treatment.
- Pan & Zoom: slow Ken Burns-style photo movement.
- Scrapbook Reveal: images slide into place with tape accents.
- Filmstrip Scroll: horizontal film-strip motion for multi-photo layouts.

Audio keepsakes animate a waveform. Video keepsakes use their generated thumbnail as an animated intro/outro surface.

## Timing Engine

`useAnimationEngine` owns timing, easing, loop behavior, and high-resolution metadata defaults.

## Export

`animatedExportService.ts` returns typed mock artifacts for:
- Static PNG
- MP4
- GIF
- WebM

The mock pipeline preserves the interface needed for production encoding. Real MP4/GIF rendering should plug in an encoder such as FFmpeg WASM or a server-side render worker.

## QR Playback

When an animated keepsake is saved with a QR placeholder or non-`none` animation style, the editor creates a QR record tied to the saved keepsake. `/qr/:id` renders the animated version when the QR record references an animated keepsake.
