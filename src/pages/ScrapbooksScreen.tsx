import { BookOpen, FileDown, Images, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookPagePreview } from '../components/BookPagePreview';
import type { Book, BookKind, BookTheme } from '../models/book';
import type { KeepsakeMediaAsset } from '../models/keepsake';
import { createGeneratedBook, listBooks } from '../api/pagesComeToLifeApi';
import { getKeepsakes } from '../services/keepsakeStorage';
import { getMemoryItems } from '../services/memoryStorage';

const themeOptions: { id: BookTheme; label: string }[] = [
  { id: 'babys-first-year', label: "Baby's First Year" },
  { id: 'wedding', label: 'Wedding' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'memorial', label: 'Memorial' },
  { id: 'travel', label: 'Travel' },
  { id: 'family-history', label: 'Family History' },
];

function toMediaAssets(): KeepsakeMediaAsset[] {
  const memoryMedia = getMemoryItems().map((item) => ({
    id: item.id,
    type: 'photo' as const,
    src: item.src,
    thumbnailUrl: item.src,
    fileName: item.eventTag || item.location,
    qrLinkedContent: { fileId: item.id, contentType: 'photo' as const },
  }));

  const keepsakeMedia = getKeepsakes().flatMap((keepsake) => keepsake.mediaItems ?? []);
  return [...keepsakeMedia, ...memoryMedia].slice(0, 18);
}

export function ScrapbooksScreen() {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState('My Keepsake Book');
  const [kind, setKind] = useState<BookKind>('scrapbook');
  const [theme, setTheme] = useState<BookTheme>('family-history');
  const [isGenerating, setIsGenerating] = useState(false);
  const media = useMemo(() => toMediaAssets(), []);

  useEffect(() => {
    void listBooks().then(setBooks);
  }, []);

  async function handleGenerateBook() {
    setIsGenerating(true);
    const book = await createGeneratedBook({
      title: title.trim() || 'My Keepsake Book',
      kind,
      theme,
      media,
      stories: ['A beginning page for the story behind this collection.'],
      aiSummary: 'A softly arranged collection of moments, captions, and media links.',
    });
    setBooks((current) => [book, ...current.filter((item) => item.id !== book.id)]);
    setIsGenerating(false);
    navigate(`/scrapbooks/${book.id}`);
  }

  return (
    <section className="w-full space-y-6 md:space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">
            Pages Come To Life
          </p>
          <h1 className="font-heading text-[3rem] font-bold leading-[0.94] text-keepsake-ink md:text-6xl">
            Scrapbooks and albums that remember more.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-keepsake-muted md:text-xl md:leading-8">
            Generate editable books from photos, videos, audio, letters, and stories, then export or send them to a mock print partner.
          </p>
        </div>

        <div className="ks-card p-4 md:p-6">
          <h2 className="font-heading text-3xl font-bold text-keepsake-ink">Create a new book</h2>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="ks-form-label text-sm font-bold">Title</span>
              <input
                className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none focus:ring-2 focus:ring-keepsake-rose/25"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="ks-form-label text-sm font-bold">Book type</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none"
                  value={kind}
                  onChange={(event) => setKind(event.target.value as BookKind)}
                >
                  <option value="scrapbook">Scrapbook</option>
                  <option value="photo-album">Photo Album</option>
                </select>
              </label>
              <label className="grid gap-2">
                <span className="ks-form-label text-sm font-bold">Theme</span>
                <select
                  className="min-h-12 rounded-2xl border border-keepsake-roseDeep/10 bg-keepsake-cream px-4 font-semibold text-keepsake-ink outline-none"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as BookTheme)}
                >
                  {themeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-4 text-sm font-extrabold"
              type="button"
              onClick={handleGenerateBook}
            >
              <Sparkles size={18} aria-hidden="true" />
              {isGenerating ? 'Generating...' : 'Auto-generate book'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { icon: BookOpen, label: 'Scrapbooks', text: 'Mixed-media pages with stories, captions, and QR-linked memories.' },
          { icon: Images, label: 'Photo Albums', text: 'Clean photo-forward layouts for high-resolution print exports.' },
          { icon: FileDown, label: 'Print & QR', text: 'Mock PDF export, print partners, and public QR view pages.' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div className="ks-dark-feature p-5" key={item.label}>
              <Icon className="text-keepsake-accent" size={23} aria-hidden="true" />
              <h3 className="mt-3 font-heading text-2xl font-bold text-white">{item.label}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/82">{item.text}</p>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="font-heading text-3xl font-bold text-keepsake-ink md:text-4xl">Your books</h2>
        {books.length === 0 ? (
          <p className="mt-3 text-keepsake-muted">No books yet. Generate one from your saved Memory Box and keepsake media.</p>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Link className="block" key={book.id} to={`/scrapbooks/${book.id}`}>
                <BookPagePreview page={book.pages[0]} />
                <h3 className="mt-3 font-heading text-2xl font-bold text-keepsake-ink">{book.title}</h3>
                <p className="text-sm font-semibold text-keepsake-muted">
                  {book.pages.length} pages • {book.kind}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
