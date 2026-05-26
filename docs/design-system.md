# Keepsake Design System

## Theme Palettes

The app uses CSS variables in `src/styles/global.css` and Tailwind tokens in `tailwind.config.ts`.

Core nostalgic tones:
- Blush: `#F5E8E4`
- Sage: `#E8F0E8`
- Cream: `#FDF7E3`
- Cool Gray: `#DCE3E8`
- Accent Gold: `#E0A458`
- Accent Teal: `#00A6A6`

Selectable themes:
- Vintage: warm gold accent, rose-primary nostalgia.
- Modern: teal accent, cleaner cool-gray balance.
- Pastel: softer blush and teal, gentler contrast.
- Bold: deeper primary with teal accent for stronger calls to action.

The selected theme is stored in `localStorage` under `keepsake.theme` and applied to `<html data-theme="...">`.

## Component Rules

Shared premium primitives:
- `.ks-card`: 12px radius, soft border, linen-friendly translucent surface, `0 4px 12px rgba(0,0,0,0.1)` shadow.
- `.ks-button-primary`: accent-colored pill button with hover glow and press scale.
- `.ks-qr-glow`: QR-linked item hover glow using `0 0 8px rgba(0,166,166,0.4)` or the active theme accent.
- `.ks-section-divider`: dotted color separator for emotional section breaks.

## Typography

- Headings: `Playfair Display`, serif fallback.
- Body: `Inter`, system sans fallback.
- Captions: muted gray `#6B6B6B`, `0.5px` letter spacing via `.ks-caption-reveal`.
- Spacing follows an 8-point rhythm where practical through Tailwind `gap-4`, `gap-6`, `p-4`, `p-6`, and section `space-y-6 md:space-y-10`.

## Motion Specs

- Photo fade-in: `.ks-photo-reveal`, 420ms ease-out.
- Caption slide-up: `.ks-caption-reveal`, 520ms ease-out.
- Page transition/ripple: `.ks-page-transition`, 260ms ease-out.
- Hover zoom: interactive cards use `hover:scale-[1.01]`.
- Button press: primary controls use `active:scale-[0.96]`.

## Dark Mode

Dark mode adapts the same theme variables with darker cream/blush/sage/cool-gray surfaces, light ink, and reduced texture opacity. Theme accents remain vivid enough for active tabs, buttons, QR highlights, and dividers.
