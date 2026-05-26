import type { Book, BookGenerationInput, BookPage, BookTextBlock } from '../models/book';
import type { KeepsakeMediaAsset } from '../models/keepsake';
import { getLayout, suggestPageType } from './layoutTemplateService';
import { createQrRecord } from './qrService';

function createId(prefix: string) {
  const suffix =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function chunkMedia(media: KeepsakeMediaAsset[], size: number) {
  const chunks: KeepsakeMediaAsset[][] = [];
  for (let index = 0; index < media.length; index += size) {
    chunks.push(media.slice(index, index + size));
  }
  return chunks;
}

function textBlock(role: BookTextBlock['role'], value: string): BookTextBlock {
  return {
    id: createId(role),
    role,
    value,
  };
}

export function generateBook(input: BookGenerationInput): Book {
  const now = new Date().toISOString();
  const pageSize = input.kind === 'photo-album' ? 4 : 3;
  const mediaGroups = chunkMedia(input.media, pageSize);
  const pages: BookPage[] = mediaGroups.map((media, index) => {
    const hasQrMedia = media.some((item) => item.type === 'video' || item.type === 'audio');
    const pageType = input.kind === 'photo-album' && !hasQrMedia ? 'collage' : suggestPageType(media.length, false, hasQrMedia);
    const qrCode = hasQrMedia
      ? createQrRecord({
          content: media.filter((item) => item.type === 'video' || item.type === 'audio'),
          title: `${input.title} media ${index + 1}`,
        })
      : undefined;

    return {
      id: createId('page'),
      type: pageType,
      layout: getLayout(pageType, input.theme, Math.min(Math.max(media.length, 1), 4)),
      media,
      text: [
        textBlock('title', index === 0 ? input.title : `Memory ${index + 1}`),
        textBlock('caption', input.aiSummary ?? 'A gathered page of moments, ready to edit.'),
      ],
      qrCode,
      theme: input.theme,
      editable: true,
      sortOrder: index,
    };
  });

  const storyPages = [...(input.letters ?? []), ...(input.stories ?? [])].map((story, index): BookPage => ({
    id: createId('page'),
    type: index % 2 === 0 ? 'letter' : 'story',
    layout: getLayout(index % 2 === 0 ? 'letter' : 'story', input.theme),
    media: [],
    text: [textBlock('title', index % 2 === 0 ? 'Letter' : 'Story'), textBlock('body', story)],
    theme: input.theme,
    editable: true,
    sortOrder: pages.length + index,
  }));

  const allPages = pages.length > 0 || storyPages.length > 0
    ? [...pages, ...storyPages]
    : [
        {
          id: createId('page'),
          type: 'story',
          layout: getLayout('story', input.theme),
          media: [],
          text: [textBlock('title', input.title), textBlock('body', 'Start writing this book here.')],
          theme: input.theme,
          editable: true,
          sortOrder: 0,
        } satisfies BookPage,
      ];

  return {
    id: createId('book'),
    title: input.title,
    kind: input.kind,
    theme: input.theme,
    pages: allPages,
    createdAt: now,
    updatedAt: now,
    printSettings: {
      bleedInches: 0.125,
      trimSize: input.kind === 'photo-album' ? '10x10' : '8.5x11',
      safeZoneInches: 0.25,
      colorMode: 'cmyk-print',
      fontEmbedding: true,
    },
  };
}

export function reorderBookPages(book: Book, sourcePageId: string, targetPageId: string): Book {
  const pages = book.pages.slice();
  const sourceIndex = pages.findIndex((page) => page.id === sourcePageId);
  const targetIndex = pages.findIndex((page) => page.id === targetPageId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return book;
  }

  const [moved] = pages.splice(sourceIndex, 1);
  pages.splice(targetIndex, 0, moved);

  return {
    ...book,
    pages: pages.map((page, index) => ({ ...page, sortOrder: index })),
    updatedAt: new Date().toISOString(),
  };
}

export function updateBookPage(book: Book, pageId: string, updates: Partial<BookPage>): Book {
  return {
    ...book,
    pages: book.pages.map((page) => (page.id === pageId ? { ...page, ...updates } : page)),
    updatedAt: new Date().toISOString(),
  };
}
