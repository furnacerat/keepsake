import { Download, Printer, QrCode, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BookPagePreview } from '../components/BookPagePreview';
import type { Book, BookPage } from '../models/book';
import {
  exportBook,
  findBook,
  reorderPages,
  sendBookToPrint,
  updatePage,
} from '../api/pagesComeToLifeApi';
import type { PdfExportFormat } from '../services/pdfExportService';

export function BookEditorScreen() {
  const { id } = useParams();
  const [book, setBook] = useState<Book>();
  const [selectedPageId, setSelectedPageId] = useState<string>();
  const [status, setStatus] = useState('');
  const [exportFormat, setExportFormat] = useState<PdfExportFormat>('high-res-print');

  useEffect(() => {
    if (!id) {
      return;
    }

    void findBook(id).then((nextBook) => {
      setBook(nextBook);
      setSelectedPageId(nextBook?.pages[0]?.id);
    });
  }, [id]);

  if (!id) {
    return <Navigate to="/scrapbooks" replace />;
  }

  if (!book) {
    return (
      <section className="rounded-[1.45rem] bg-white/78 p-6 shadow-keepsake">
        <p className="font-bold text-keepsake-muted">Loading book...</p>
      </section>
    );
  }

  const selectedPage = book.pages.find((page) => page.id === selectedPageId) ?? book.pages[0];

  async function handlePageTextChange(value: string) {
    if (!book || !selectedPage) {
      return;
    }

    const nextText = selectedPage.text.map((block, index) => (index === 0 ? { ...block, value } : block));
    const nextBook = await updatePage(book, selectedPage.id, { text: nextText });
    setBook(nextBook);
  }

  async function handleDropPage(sourcePageId: string, targetPageId: string) {
    if (!book) {
      return;
    }

    const nextBook = await reorderPages(book, sourcePageId, targetPageId);
    setBook(nextBook);
  }

  async function handleExport() {
    if (!book) {
      return;
    }

    const result = await exportBook(book, exportFormat);
    setStatus(`${result.fileName} ready (${result.pageCount} pages, ${result.renderSettings.colorMode}).`);
  }

  async function handlePrint() {
    if (!book) {
      return;
    }

    const order = await sendBookToPrint(book, {
      partner: 'mixam',
      format: 'high-res-print',
      bindingType: 'perfect-bound',
      paperType: 'matte',
    });
    setStatus(`Mock ${order.partner} order submitted: ${order.trackingCode}`);
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link className="text-sm font-bold text-keepsake-roseDeep" to="/scrapbooks">
            Scrapbooks
          </Link>
          <h1 className="mt-3 font-heading text-[3rem] font-bold leading-[0.94] text-keepsake-ink md:text-6xl">
            {book.title}
          </h1>
          <p className="mt-3 text-base font-semibold text-keepsake-muted">
            {book.pages.length} editable pages • {book.theme}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="min-h-11 rounded-full border border-keepsake-roseDeep/10 bg-white/80 px-4 text-sm font-bold text-keepsake-ink"
            value={exportFormat}
            onChange={(event) => setExportFormat(event.target.value as PdfExportFormat)}
          >
            <option value="standard">Standard PDF</option>
            <option value="high-res-print">High-res print PDF</option>
            <option value="booklet">Booklet format</option>
            <option value="single-page">Single-page export</option>
          </select>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/80 px-4 text-sm font-extrabold text-keepsake-accentStrong shadow-soft transition active:scale-[0.96] hover:shadow-glow"
            type="button"
            onClick={handleExport}
          >
            <Download size={17} aria-hidden="true" />
            Export
          </button>
          <button
            className="ks-button-primary inline-flex min-h-11 items-center gap-2 px-4 text-sm font-extrabold"
            type="button"
            onClick={handlePrint}
          >
            <Printer size={17} aria-hidden="true" />
            Print
          </button>
        </div>
      </div>

      {status ? (
        <div className="rounded-2xl bg-keepsake-ink px-4 py-3 text-sm font-bold text-white shadow-keepsake" role="status">
          {status}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {book.pages.map((page) => (
            <BookPagePreview
              key={page.id}
              page={page}
              selected={page.id === selectedPage.id}
              onDropPage={handleDropPage}
              onSelect={() => setSelectedPageId(page.id)}
            />
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/80 p-4 shadow-keepsake">
            <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Edit page</h2>
            <p className="mt-1 text-sm font-semibold text-keepsake-muted">{selectedPage.type} layout</p>
            <label className="mt-4 grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Page title</span>
              <input
                className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none"
                value={selectedPage.text[0]?.value ?? ''}
                onChange={(event) => void handlePageTextChange(event.target.value)}
              />
            </label>
            <div className="mt-4 rounded-2xl bg-keepsake-cream p-4">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-roseDeep">Layout</p>
              <p className="mt-2 font-bold text-keepsake-ink">{selectedPage.layout.name}</p>
              <p className="mt-1 text-sm text-keepsake-muted">
                {selectedPage.layout.columns} columns • {selectedPage.layout.density} density • safe print margins
              </p>
            </div>
          </section>

          <section className="rounded-[1.45rem] border border-keepsake-roseDeep/10 bg-white/80 p-4 shadow-keepsake">
            <h2 className="font-heading text-2xl font-bold text-keepsake-ink">QR-linked pages</h2>
            {book.pages.filter((page): page is BookPage & { qrCode: NonNullable<BookPage['qrCode']> } => Boolean(page.qrCode)).length === 0 ? (
              <p className="mt-2 text-sm text-keepsake-muted">No QR-linked media yet.</p>
            ) : (
              <div className="mt-3 grid gap-2">
                {book.pages
                  .filter((page): page is BookPage & { qrCode: NonNullable<BookPage['qrCode']> } => Boolean(page.qrCode))
                  .map((page) => (
                    <Link
                      className="ks-qr-glow inline-flex items-center gap-2 rounded-keepsake bg-keepsake-blush/55 px-3 py-2 text-sm font-bold text-keepsake-accentStrong"
                      key={page.qrCode.id}
                      to={page.qrCode.url}
                    >
                      <QrCode size={16} aria-hidden="true" />
                      {page.qrCode.title}
                    </Link>
                  ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
