# Pages Come To Life

Keepsake now has a mock-backed book generation layer for scrapbooks, photo albums, print export, print-on-demand partners, and QR-linked media pages.

## Book JSON Schema

Books are validated with `bookSchema` in `src/models/book.ts`.

```ts
{
  id: string,
  title: string,
  kind: "scrapbook" | "photo-album",
  theme: "babys-first-year" | "wedding" | "graduation" | "memorial" | "travel" | "family-history",
  pages: [{
    id: string,
    type: "photo" | "collage" | "story" | "letter" | "timeline" | "memory-map" | "qr-linked" | "mixed",
    layout: BookLayout,
    media: KeepsakeMediaAsset[],
    text: BookTextBlock[],
    qrCode?: QrCodeRecord,
    theme: BookTheme,
    editable: boolean,
    sortOrder: number
  }],
  printSettings: {
    bleedInches: number,
    trimSize: string,
    safeZoneInches: number,
    colorMode: "rgb-preview" | "cmyk-print",
    fontEmbedding: boolean
  }
}
```

## Template Engine

`src/services/layoutTemplateService.ts` contains predefined layouts and AI-style layout suggestions. Layouts include padding, margins, backgrounds, frames, stickers, decorative elements, palettes, and typography sets.

The current UI renders book pages through `BookPagePreview`, while keepsake page templates still render through `TemplateEngine` and `MediaEngine`.

## PDF Export

`src/services/pdfExportService.ts` creates a mocked `application/pdf` Blob from book JSON. It records print settings for bleed, trim, safe zones, font embedding, QR embedding, high-resolution image preservation, and CMYK print mode.

Supported export modes:
- `standard`
- `high-res-print`
- `booklet`
- `single-page`

## QR System

`src/services/qrService.ts` creates QR metadata records and deterministic SVG data URLs. QR records support:
- Public
- Private PIN
- Unlisted
- Family-only

QR pages are available at `/qr/:id` and currently resolve linked local media where available.

## Print-On-Demand

`src/services/printOnDemandService.ts` mocks partner APIs for:
- Mixam
- Blurb
- Printify

The mock flow supports PDF upload, binding type, paper type, order submission, and order tracking.

## Frontend Routes

- `/scrapbooks`: create and browse generated books
- `/scrapbooks/:id`: edit pages, drag pages, export, and submit mock print orders
- `/qr/:id`: public Pages Come To Life view page

## Tests

`src/services/pagesComeToLife.test.ts` covers:
- Book generation
- Page reordering
- Layout snapshots
- PDF rendering metadata
- QR generation
- Mock print-on-demand flow
