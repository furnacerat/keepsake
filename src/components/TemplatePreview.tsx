import { TemplateEngine } from './TemplateEngine';
import type { TemplateDefinition } from '../data/templates';
import type { TemplateMedia } from './MediaEngine';

type TemplatePreviewProps = {
  isSelected?: boolean;
  onSelect: () => void;
  template: TemplateDefinition;
};

const samplePhotos = [
  { id: 'sample-1', src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 240%22%3E%3Crect width=%22320%22 height=%22240%22 fill=%22%23f7e8d8%22/%3E%3Ccircle cx=%22105%22 cy=%2290%22 r=%2242%22 fill=%22%23b96e6f%22 opacity=%22.55%22/%3E%3Cpath d=%22M20 218 120 132l58 46 44-34 78 74z%22 fill=%22%2380957a%22 opacity=%22.55%22/%3E%3C/svg%3E' },
  { id: 'sample-2', src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 240%22%3E%3Crect width=%22320%22 height=%22240%22 fill=%22%23fff0ec%22/%3E%3Cpath d=%22M40 190c40-70 94-98 160-82 42 10 72 42 90 82z%22 fill=%22%23c99c5f%22 opacity=%22.6%22/%3E%3Ccircle cx=%22235%22 cy=%2270%22 r=%2238%22 fill=%22%23b96e6f%22 opacity=%22.45%22/%3E%3C/svg%3E' },
  { id: 'sample-3', src: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 240%22%3E%3Crect width=%22320%22 height=%22240%22 fill=%22%23eef4e9%22/%3E%3Ccircle cx=%2280%22 cy=%2280%22 r=%2248%22 fill=%22%2380957a%22 opacity=%22.45%22/%3E%3Crect x=%22135%22 y=%2270%22 width=%22125%22 height=%22105%22 rx=%2218%22 fill=%22%23b96e6f%22 opacity=%22.35%22/%3E%3C/svg%3E' },
];

const sampleMedia: TemplateMedia[] = [
  { ...samplePhotos[0], type: 'photo', thumbnailUrl: samplePhotos[0].src },
  {
    id: 'sample-video',
    type: 'video',
    src: '',
    thumbnailUrl:
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 240%22%3E%3Crect width=%22320%22 height=%22240%22 fill=%22%23362622%22/%3E%3Ccircle cx=%22245%22 cy=%2260%22 r=%2270%22 fill=%22%23c99c5f%22 opacity=%22.35%22/%3E%3Cpath d=%22M40 205 128 118l48 45 44-34 62 76z%22 fill=%22%23fff7ed%22 opacity=%22.75%22/%3E%3Ccircle cx=%22160%22 cy=%22118%22 r=%2232%22 fill=%22%23b96e6f%22/%3E%3Cpath d=%22m153 102 28 16-28 16z%22 fill=%22white%22/%3E%3C/svg%3E',
    duration: 42,
    qrLinkedContent: { fileId: 'sample-video', contentType: 'video' },
  },
  {
    id: 'sample-audio',
    type: 'audio',
    src: '',
    thumbnailUrl: '',
    duration: 86,
    qrLinkedContent: { fileId: 'sample-audio', contentType: 'audio' },
  },
];

export function TemplatePreview({ isSelected, onSelect, template }: TemplatePreviewProps) {
  const isVideoTemplate = template.supportedMediaTypes?.includes('video') || template.supportedMediaTypes?.includes('mixed');

  return (
    <button
      className={[
        'rounded-[1.25rem] border bg-white/78 p-3 text-left shadow-soft transition hover:-translate-y-0.5',
        isSelected ? 'border-keepsake-accent ring-2 ring-keepsake-accent/35' : 'border-keepsake-roseDeep/10',
      ].join(' ')}
      type="button"
      onClick={onSelect}
    >
      <div className="pointer-events-none origin-top scale-[0.32]">
        <div className={['w-[360px]', isVideoTemplate ? 'animate-pulse' : ''].join(' ')}>
          <TemplateEngine
            templateId={template.id}
            data={{
              photos: samplePhotos,
              media: sampleMedia,
              title: template.name,
              body: 'A small story lives here.',
              backgroundStyle: 'warm',
              eventTag: 'Memory',
              showQrPlaceholder: template.id === 'video-memory-page',
              showPlaybackControls: false,
            }}
          />
        </div>
      </div>
      <div className="-mt-44">
        <p className="font-heading text-xl font-bold leading-none text-keepsake-ink">{template.name}</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-keepsake-muted">{template.description}</p>
      </div>
    </button>
  );
}
