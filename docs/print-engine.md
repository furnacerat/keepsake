# Print-Ready Export System

Phase 9 adds a print-ready export layer for templates, scrapbook pages, albums, and static frames from animated keepsakes.

## Core Files

- `src/services/PrintEngine.ts`
- `src/services/AlbumExport.ts`
- `src/hooks/usePrintEngine.ts`
- `src/components/ExportDialog.tsx`

## Export Types

- `png`
- `pdf-page`
- `pdf-album`

## Resolution Options

- `1080p`
- `4k`
- `print-300`
- `ultra-print-600`

## Print-Shop Presets

- `5x7`
- `8x10`
- `11x14`
- `12x12`
- `a4`
- `custom`

Each preset includes bleed, trim, and safe-zone metadata.

## CMYK-Safe Output

`PrintEngine` supports `cmyk-safe` and `srgb` modes. The current implementation creates mock PDF artifacts and high-resolution PNG canvas exports, preserving the API shape needed for a real server-side renderer later.

## Template Print Mode

`TemplateEngine` supports `printMode`, which disables playback controls and animation-like effects while keeping typography and shapes crisp for export.

## Temporary Storage

The engine stores export records in a temporary in-memory map with mock signed URLs:

```txt
/exports/:id?signature=mock-...
```

Records expire after one hour and can be cleaned up with `cleanupExpiredExports()`.

## Animated Keepsakes

Animated keepsakes should export video through the Phase 7 animation export pipeline. For print, the export dialog uses a static print frame and disables dynamic media controls.
