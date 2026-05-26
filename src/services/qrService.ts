import type { QrCodeRecord, QrSecurity } from '../models/book';
import type { KeepsakeMediaAsset } from '../models/keepsake';
import type { AnimationMetadata, AnimationStyle } from '../models/keepsake';

const STORAGE_KEY = 'keepsake.qrRecords';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readRecords(): QrCodeRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(records: QrCodeRecord[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}

export function generateQrSvg(url: string) {
  const cells = Array.from(url).reduce((total, char) => total + char.charCodeAt(0), 0);
  const blocks = Array.from({ length: 49 }).map((_, index) => {
    const x = index % 7;
    const y = Math.floor(index / 7);
    const filled = (cells + index * 13 + x * y) % 3 !== 0;
    return filled ? `<rect x="${x * 8}" y="${y * 8}" width="7" height="7" rx="1" fill="%23362622"/>` : '';
  });

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' rx='6' fill='white'/%3E${blocks.join(
    '',
  )}%3C/svg%3E`;
}

export function createQrRecord({
  animationMetadata,
  animationStyle,
  content,
  keepsakeId,
  security = 'unlisted',
  title,
}: {
  content: KeepsakeMediaAsset[];
  animationMetadata?: AnimationMetadata;
  animationStyle?: AnimationStyle;
  keepsakeId?: string;
  security?: QrSecurity;
  title: string;
}) {
  const id = createId();
  const contentType =
    content.some((item) => item.type === 'video')
      ? 'video'
      : content.some((item) => item.type === 'audio')
        ? 'audio'
        : content.length > 1
          ? 'gallery'
          : 'story';
  const record: QrCodeRecord = {
    id,
    url: `/qr/${id}`,
    security,
    pin: security === 'private-pin' ? '1948' : undefined,
    contentType,
    contentIds: content.map((item) => item.id),
    title,
    animationStyle,
    animationMetadata,
    keepsakeId,
  };

  writeRecords([record, ...readRecords()]);
  return record;
}

export function getQrRecords() {
  return readRecords();
}

export function getQrRecord(id: string) {
  return readRecords().find((record) => record.id === id);
}
