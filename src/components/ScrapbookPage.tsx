import { TemplateEngine } from './TemplateEngine';
import { getMemoryItem } from '../services/memoryStorage';
import type { MemoryItem } from '../models/memory';

function isMemoryItem(item: MemoryItem | undefined): item is MemoryItem {
  return Boolean(item);
}

type ScrapbookPageProps = {
  templateId: string;
  photoIds: string[];
  text: string;
  title?: string;
  eventTag?: string;
  date?: string;
  backgroundStyle?: string;
};

export function ScrapbookPage({
  backgroundStyle = 'warm',
  date,
  eventTag,
  photoIds,
  templateId,
  text,
  title = 'Scrapbook Page',
}: ScrapbookPageProps) {
  const photos = photoIds
    .map((id) => getMemoryItem(id))
    .filter(isMemoryItem)
    .map((item) => ({ id: item.id, src: item.src }));

  return (
    <TemplateEngine
      templateId={templateId}
      data={{ photos, title, body: text, eventTag, date, backgroundStyle, highResolution: true }}
    />
  );
}
