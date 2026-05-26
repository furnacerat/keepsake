import { GripVertical, QrCode } from 'lucide-react';
import type { DragEvent } from 'react';
import type { BookPage } from '../models/book';
import { generateQrSvg } from '../services/qrService';
import { MediaEngine } from './MediaEngine';

type BookPagePreviewProps = {
  page: BookPage;
  onDropPage?: (sourcePageId: string, targetPageId: string) => void;
  onSelect?: () => void;
  selected?: boolean;
};

export function BookPagePreview({ onDropPage, onSelect, page, selected }: BookPagePreviewProps) {
  function handleDragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.setData('text/plain', page.id);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const sourcePageId = event.dataTransfer.getData('text/plain');
    if (sourcePageId) {
      onDropPage?.(sourcePageId, page.id);
    }
  }

  const title = page.text.find((block) => block.role === 'title')?.value ?? page.type;
  const body = page.text.find((block) => block.role === 'body' || block.role === 'caption' || block.role === 'ai-summary')?.value;

  return (
    <article
      className={[
        'ks-card group rounded-keepsake p-4 text-left transition hover:-translate-y-0.5 hover:scale-[1.01]',
        page.qrCode ? 'ks-qr-glow' : '',
        selected ? 'border-keepsake-accent ring-2 ring-keepsake-accent/30' : '',
      ].join(' ')}
      draggable
      onClick={onSelect}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rounded-full bg-keepsake-blush px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-keepsake-accentStrong">
          {page.type}
        </span>
        <GripVertical className="text-keepsake-muted/60" size={18} aria-hidden="true" />
      </div>

      <div className="aspect-[8.5/11] overflow-hidden rounded-2xl bg-gradient-to-br from-keepsake-cream via-white to-keepsake-blush p-3">
        {page.media.length > 0 ? (
          <div
            className="grid h-[62%] gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(page.layout.columns, page.media.length)}, minmax(0, 1fr))` }}
          >
            {page.media.slice(0, 4).map((media) => (
              <MediaEngine className="min-h-0" controls={false} key={media.id} media={media} mode="export" />
            ))}
          </div>
        ) : (
          <div className="grid h-[45%] place-items-center rounded-2xl bg-white/65 font-heading text-2xl font-bold text-keepsake-ink">
            Story
          </div>
        )}

        <div className="mt-3 rounded-2xl bg-white/72 p-3">
          <h3 className="font-heading text-2xl font-bold leading-none text-keepsake-ink">{title}</h3>
          {body ? <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-keepsake-muted">{body}</p> : null}
        </div>

        {page.qrCode ? (
          <div className="mt-3 flex items-center gap-2">
            <img className="h-12 w-12 rounded-lg" src={generateQrSvg(page.qrCode.url)} alt="" />
            <span className="inline-flex items-center gap-1 text-xs font-bold text-keepsake-accentStrong">
              <QrCode size={13} aria-hidden="true" />
              Pages Come To Life
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
