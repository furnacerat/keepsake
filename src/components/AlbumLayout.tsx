import { TemplateEngine } from './TemplateEngine';
import { getMemoryItem } from '../services/memoryStorage';
import type { MemoryItem } from '../models/memory';

function isMemoryItem(item: MemoryItem | undefined): item is MemoryItem {
  return Boolean(item);
}

type AlbumLayoutProps = {
  templateId: string;
  photoIds: string[];
  title?: string;
  backgroundStyle?: string;
};

export function AlbumLayout({
  backgroundStyle = 'warm',
  photoIds,
  templateId,
  title = 'Album Spread',
}: AlbumLayoutProps) {
  const photos = photoIds
    .map((id) => getMemoryItem(id))
    .filter(isMemoryItem)
    .map((item) => ({ id: item.id, src: item.src }));

  return (
    <TemplateEngine
      templateId={templateId}
      data={{ photos, title, body: '', backgroundStyle, highResolution: true }}
    />
  );
}
