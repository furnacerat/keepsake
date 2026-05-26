import type { Keepsake } from '../models/keepsake';
import type { PrintRenderResult, PrintRenderSettings } from './PrintEngine';
import { estimatePrintFileSize, resolvePrintDimensions } from './PrintEngine';

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function renderAlbumExport({
  keepsakes,
  settings,
  title = 'Keepsake Album',
}: {
  keepsakes: Keepsake[];
  settings: Omit<PrintRenderSettings, 'exportType'> & { exportType?: 'pdf-album' };
  title?: string;
}): Promise<PrintRenderResult> {
  const id = createId();
  const dimensions = resolvePrintDimensions({ ...settings, exportType: 'pdf-album' });
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  const payload = {
    kind: 'KEEPSAKE_ALBUM_MOCK_PDF',
    title,
    pageCount: keepsakes.length,
    keepsakes: keepsakes.map((keepsake, index) => ({
      page: index + 1,
      title: keepsake.title,
      templateId: keepsake.templateId,
      staticFrameForAnimation: keepsake.animationStyle && keepsake.animationStyle !== 'none',
    })),
    settings,
    dimensions,
    bleed: dimensions.bleedPx,
    trim: dimensions.trimPx,
    safeZone: dimensions.safeZonePx,
  };

  const blob = new Blob([`%PDF-KEEPSAKE-ALBUM\n${JSON.stringify(payload, null, 2)}\n%%EOF`], {
    type: 'application/pdf',
  });

  return {
    id,
    blob,
    fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'keepsake-album'}.pdf`,
    mimeType: 'application/pdf',
    estimatedBytes: estimatePrintFileSize({ ...settings, exportType: 'pdf-album' }, Math.max(1, keepsakes.length)),
    signedUrl: `/exports/${id}?signature=mock-${id.slice(0, 8)}`,
    expiresAt,
    settings: {
      colorProfile: settings.colorProfile,
      exportType: 'pdf-album',
      printSize: settings.printSize,
      resolution: settings.resolution,
      ...dimensions,
    },
  };
}
