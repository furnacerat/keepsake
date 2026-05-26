import type { Book, BookGenerationInput, BookPage } from '../models/book';
import { generateBook, reorderBookPages, updateBookPage } from '../services/bookGenerationService';
import { getBook, getBooks, saveBook } from '../services/bookStorage';
import { renderBookToPdf } from '../services/pdfExportService';
import type { PdfExportFormat } from '../services/pdfExportService';
import { submitPrintOrder, trackPrintOrder, uploadPdfToPrintPartner } from '../services/printOnDemandService';
import type { BindingType, PaperType, PrintPartner } from '../services/printOnDemandService';
import { createQrRecord, getQrRecord } from '../services/qrService';
import type { KeepsakeMediaAsset } from '../models/keepsake';

export async function createGeneratedBook(input: BookGenerationInput) {
  return saveBook(generateBook(input));
}

export async function listBooks() {
  return getBooks();
}

export async function findBook(id: string) {
  return getBook(id);
}

export async function updatePage(book: Book, pageId: string, updates: Partial<BookPage>) {
  return saveBook(updateBookPage(book, pageId, updates));
}

export async function reorderPages(book: Book, sourcePageId: string, targetPageId: string) {
  return saveBook(reorderBookPages(book, sourcePageId, targetPageId));
}

export async function createQrLinkedContent(content: KeepsakeMediaAsset[], title: string) {
  return createQrRecord({ content, title, security: 'unlisted' });
}

export async function getQrLinkedContent(id: string) {
  return getQrRecord(id);
}

export async function exportBook(book: Book, format: PdfExportFormat) {
  return renderBookToPdf(book, format);
}

export async function sendBookToPrint(
  book: Book,
  options: {
    partner: PrintPartner;
    format: PdfExportFormat;
    bindingType: BindingType;
    paperType: PaperType;
  },
) {
  const pdf = renderBookToPdf(book, options.format);
  const order = await uploadPdfToPrintPartner(options.partner, pdf);
  return submitPrintOrder(order.id, {
    bindingType: options.bindingType,
    paperType: options.paperType,
  });
}

export async function trackBookPrintOrder(orderId: string) {
  return trackPrintOrder(orderId);
}
