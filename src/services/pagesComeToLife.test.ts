import { describe, expect, it } from 'vitest';
import type { KeepsakeMediaAsset } from '../models/keepsake';
import { generateBook, reorderBookPages } from './bookGenerationService';
import { getLayout } from './layoutTemplateService';
import { renderBookToPdf } from './pdfExportService';
import { submitPrintOrder, trackPrintOrder, uploadPdfToPrintPartner } from './printOnDemandService';
import { createQrRecord, generateQrSvg } from './qrService';

const media: KeepsakeMediaAsset[] = [
  {
    id: 'photo-1',
    type: 'photo',
    src: 'data:image/png;base64,photo',
    thumbnailUrl: 'data:image/png;base64,photo',
  },
  {
    id: 'video-1',
    type: 'video',
    src: 'data:video/mp4;base64,video',
    thumbnailUrl: 'data:image/jpeg;base64,thumb',
    duration: 31,
  },
  {
    id: 'audio-1',
    type: 'audio',
    src: 'data:audio/mp3;base64,audio',
    thumbnailUrl: 'data:image/svg+xml,wave',
    duration: 72,
  },
];

describe('Pages Come To Life generation', () => {
  it('generates a valid editable mixed-media scrapbook JSON structure', () => {
    const book = generateBook({
      title: 'Family Trip',
      kind: 'scrapbook',
      theme: 'travel',
      media,
      stories: ['A short story from the road.'],
      aiSummary: 'A trip summary.',
    });

    expect(book.pages.length).toBeGreaterThan(1);
    expect(book.pages[0]).toMatchObject({
      editable: true,
      theme: 'travel',
    });
    expect(book.pages.some((page) => page.qrCode)).toBe(true);
  });

  it('supports drag-style page reordering', () => {
    const book = generateBook({
      title: 'Reorder Test',
      kind: 'photo-album',
      theme: 'family-history',
      media: [...media, { ...media[0], id: 'photo-2' }, { ...media[0], id: 'photo-3' }],
    });
    const reordered = reorderBookPages(book, book.pages[0].id, book.pages[1].id);

    expect(reordered.pages[1].id).toBe(book.pages[0].id);
    expect(reordered.pages.map((page) => page.sortOrder)).toEqual(reordered.pages.map((_, index) => index));
  });
});

describe('Layout snapshots', () => {
  it('keeps the QR page layout contract stable', () => {
    expect(getLayout('qr-linked', 'memorial')).toMatchSnapshot();
  });
});

describe('PDF export', () => {
  it('renders high-res print settings with QR embedding metadata', () => {
    const book = generateBook({
      title: 'Print Test',
      kind: 'scrapbook',
      theme: 'wedding',
      media,
    });
    const result = renderBookToPdf(book, 'high-res-print');

    expect(result.blob.type).toBe('application/pdf');
    expect(result.renderSettings.embedsFonts).toBe(true);
    expect(result.renderSettings.embedsQrCodes).toBe(true);
    expect(result.renderSettings.colorMode).toBe('cmyk-print');
  });
});

describe('QR generation', () => {
  it('creates QR metadata and a deterministic SVG data URL', () => {
    const record = createQrRecord({ content: media.slice(1), title: 'Watch this memory', security: 'private-pin' });
    const svg = generateQrSvg(record.url);

    expect(record.pin).toBe('1948');
    expect(record.contentType).toBe('video');
    expect(svg).toContain('data:image/svg+xml');
  });
});

describe('Mock print-on-demand', () => {
  it('uploads, submits, and tracks a partner order', async () => {
    const book = generateBook({ title: 'Print Partner', kind: 'photo-album', theme: 'graduation', media });
    const pdf = renderBookToPdf(book, 'booklet');
    const uploaded = await uploadPdfToPrintPartner('mixam', pdf);
    const submitted = await submitPrintOrder(uploaded.id, {
      bindingType: 'hardcover',
      paperType: 'premium-uncoated',
    });
    const tracked = await trackPrintOrder(submitted.id);

    expect(submitted.trackingCode).toContain('KS-MIXAM');
    expect(tracked.status).toBe('in-production');
  });
});
