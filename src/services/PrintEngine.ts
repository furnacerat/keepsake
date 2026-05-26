import type { TemplateRenderData } from '../components/TemplateEngine';
import { estimatePrintFileSize, resolvePrintDimensions } from './printSettings';
import type { PrintRenderResult, PrintRenderSettings } from './printSettings';
export { estimatePrintFileSize, resolvePrintDimensions } from './printSettings';
export type { PrintRenderResult, PrintRenderSettings } from './printSettings';

const temporaryExports = new Map<string, PrintRenderResult>();

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function drawPrintCanvas(canvas: HTMLCanvasElement, data: TemplateRenderData, settings: PrintRenderSettings) {
  const dimensions = resolvePrintDimensions(settings);
  canvas.width = dimensions.widthPx;
  canvas.height = dimensions.heightPx;
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  context.fillStyle = settings.colorProfile === 'cmyk-safe' ? '#F8F3EA' : '#FDF7E3';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#D9B98C';
  context.lineWidth = Math.max(2, dimensions.trimPx / 4);
  context.strokeRect(dimensions.bleedPx, dimensions.bleedPx, canvas.width - dimensions.bleedPx * 2, canvas.height - dimensions.bleedPx * 2);
  context.strokeStyle = 'rgba(0,166,166,0.32)';
  context.setLineDash([24, 18]);
  context.strokeRect(dimensions.safeZonePx, dimensions.safeZonePx, canvas.width - dimensions.safeZonePx * 2, canvas.height - dimensions.safeZonePx * 2);
  context.setLineDash([]);

  context.fillStyle = '#352A2A';
  context.font = `${Math.max(56, dimensions.widthPx * 0.055)}px Georgia, serif`;
  context.fillText(data.title || 'Keepsake', dimensions.safeZonePx, dimensions.safeZonePx + Math.max(80, dimensions.heightPx * 0.1));
  context.fillStyle = '#6B6B6B';
  context.font = `${Math.max(24, dimensions.widthPx * 0.022)}px Inter, sans-serif`;
  context.fillText((data.body || 'Print-ready keepsake export.').slice(0, 110), dimensions.safeZonePx, dimensions.safeZonePx + Math.max(150, dimensions.heightPx * 0.16));
}

export async function renderPrintExport({
  data,
  settings,
  templateId,
}: {
  data: TemplateRenderData;
  settings: PrintRenderSettings;
  templateId: string;
}): Promise<PrintRenderResult> {
  const dimensions = resolvePrintDimensions(settings);
  const id = createId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();
  const extension = settings.exportType === 'png' ? 'png' : 'pdf';
  const mimeType = settings.exportType === 'png' ? 'image/png' : 'application/pdf';
  const fileName = `${(data.title || templateId).toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'keepsake-print'}.${extension}`;

  let blob: Blob;
  if (settings.exportType === 'png' && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    drawPrintCanvas(canvas, data, settings);
    blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((nextBlob) => resolve(nextBlob ?? new Blob([], { type: mimeType })), mimeType);
    });
  } else {
    const payload = {
      kind: 'KEEPSAKE_PRINT_MOCK_PDF',
      templateId,
      data,
      dimensions,
      colorProfile: settings.colorProfile,
      printMode: true,
    };
    blob = new Blob([`%PDF-KEEPSAKE-PRINT\n${JSON.stringify(payload, null, 2)}\n%%EOF`], { type: mimeType });
  }

  const result: PrintRenderResult = {
    id,
    blob,
    fileName,
    mimeType,
    estimatedBytes: estimatePrintFileSize(settings),
    signedUrl: `/exports/${id}?signature=mock-${id.slice(0, 8)}`,
    expiresAt,
    settings: {
      colorProfile: settings.colorProfile,
      exportType: settings.exportType,
      printSize: settings.printSize,
      resolution: settings.resolution,
      ...dimensions,
    },
  };
  temporaryExports.set(id, result);
  return result;
}

export function getTemporaryExport(id: string) {
  const result = temporaryExports.get(id);
  if (!result || new Date(result.expiresAt).getTime() < Date.now()) {
    temporaryExports.delete(id);
    return undefined;
  }

  return result;
}

export function cleanupExpiredExports() {
  for (const [id, result] of temporaryExports.entries()) {
    if (new Date(result.expiresAt).getTime() < Date.now()) {
      temporaryExports.delete(id);
    }
  }
}
