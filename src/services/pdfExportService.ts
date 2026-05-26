import type { Book } from '../models/book';
import { generateQrSvg } from './qrService';

export type PdfExportFormat = 'standard' | 'high-res-print' | 'booklet' | 'single-page';

export type PdfExportResult = {
  id: string;
  fileName: string;
  format: PdfExportFormat;
  blob: Blob;
  pageCount: number;
  renderSettings: {
    bleedInches: number;
    safeZoneInches: number;
    trimSize: string;
    embedsFonts: boolean;
    embedsQrCodes: boolean;
    preservesHighResolutionImages: boolean;
    colorMode: 'rgb-preview' | 'cmyk-print';
  };
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function renderBookToPdf(book: Book, format: PdfExportFormat = 'standard'): PdfExportResult {
  const payload = {
    title: book.title,
    format,
    printSettings: book.printSettings,
    pages: book.pages.map((page) => ({
      id: page.id,
      type: page.type,
      layout: page.layout.id,
      mediaCount: page.media.length,
      text: page.text,
      qrCodeSvg: page.qrCode ? generateQrSvg(page.qrCode.url) : undefined,
    })),
  };

  const pdfLikeText = `%PDF-KEEPSAKE-MOCK\n${JSON.stringify(payload, null, 2)}\n%%EOF`;

  return {
    id: createId(),
    fileName: `${book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'keepsake-book'}-${format}.pdf`,
    format,
    blob: new Blob([pdfLikeText], { type: 'application/pdf' }),
    pageCount: format === 'single-page' ? 1 : book.pages.length,
    renderSettings: {
      bleedInches: book.printSettings.bleedInches,
      safeZoneInches: book.printSettings.safeZoneInches,
      trimSize: book.printSettings.trimSize,
      embedsFonts: book.printSettings.fontEmbedding,
      embedsQrCodes: book.pages.some((page) => Boolean(page.qrCode)),
      preservesHighResolutionImages: format !== 'standard',
      colorMode: format === 'high-res-print' ? 'cmyk-print' : book.printSettings.colorMode,
    },
  };
}
