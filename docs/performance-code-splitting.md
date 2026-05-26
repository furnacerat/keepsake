# Performance and Code Splitting

## Strategy

Keepsake now uses route-level code splitting for every top-level page. `src/App.tsx` defines each route with `React.lazy()` and wraps the element in `Suspense`, so each major screen is downloaded only when the user visits it.

Lazy-loaded route chunks include:

- Home
- Catalog
- Create
- Keepsakes dashboard
- Keepsake detail
- Memory Box
- Memory Map
- Timeline
- Scrapbooks
- Book editor
- Template editor
- Marketplace
- Creator portal
- QR view
- Paywall

Each lazy route has a warm loading state that matches the Keepsake design system.

## Vendor Chunks

Vite/Rollup manual chunks are configured in `vite.config.ts`.

- `vendor-react`: React, React DOM, and React Router
- `vendor-ui`: UI/icon framework dependencies
- `vendor-utils`: utility/schema libraries such as Zod
- `vendor`: other third-party packages

Tree-shaking remains enabled through Vite/Rollup production builds.

## Async Heavy Work

Print export rendering was moved behind dynamic imports:

- Page print rendering loads `PrintEngine` only when an export is rendered.
- Album export rendering loads `AlbumExport` only when an album export is rendered.
- Shared print presets and file-size estimation live in the lightweight `printSettings` module so the export dialog can estimate size without loading render code.

Current PDF, QR, animation, and AI features are mock/local implementations without heavy external runtime libraries. If production libraries are added later, keep them behind user-triggered `import()` calls.

## Static Assets

- The app logo was converted from PNG to WebP and the top bar now uses `/keepsake-logo.webp`.
- Non-critical images now use `loading="lazy"` and `decoding="async"`.
- `public/_headers` includes long-lived immutable caching for built assets and static images, plus no-cache for `index.html`.

## Bundle Analyzer

Run:

```bash
npm run analyze
```

This generates a visual treemap at:

```text
reports/bundle-report.html
```

## Bundle Size Report

Baseline before code splitting:

- Main JS: `533.46 kB`
- Main JS gzip: `150.54 kB`
- Warning: one large chunk over 500 kB

After code splitting:

- App entry JS: `12.23 kB`
- App entry JS gzip: `4.32 kB`
- React vendor JS: `243.06 kB`
- React vendor gzip: `77.62 kB`
- Largest route chunk: Template Editor, `33.29 kB`
- No chunk exceeds 300 kB
- No large chunk warning remains

Largest generated modules after splitting:

- `vendor-react`: React, React DOM, React Router
- `vendor-utils`: Zod
- `TemplateEditorScreen`
- `MemoryBoxScreen`
- `TimelineScreen`

No duplicate dependencies were observed in the generated chunk list.

## Further Opportunities

- Preload likely next routes after first interaction, such as `/create` from the home page CTA.
- Split `lucide-react` icons further if icon usage grows.
- Keep any future PDF, QR, FFmpeg/WASM, image-processing, or AI SDK dependencies behind dynamic imports.
- Consider service-worker caching for repeat visits once deployment target is chosen.
