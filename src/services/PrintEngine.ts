import type { TemplateRenderData } from '../components/TemplateEngine';
import type { PrintExportType, PrintResolution, PrintSize } from '../models/keepsake';

export type PrintShopPreset = {
  id: PrintSize;
  label: string;
  widthInches: number;
  heightInches: number;
  bleedInches: number;
  trimInches: number;
  safeZoneInches: number;
};

export type PrintResolutionSettings = {
  id: PrintResolution;
  label: string;
  dpi: number;
  widthPx?: number;
  heightPx?: number;
};

export type PrintRenderSettings = {
  colorProfile: 'srgb' | 'cmyk-safe';
  exportType: PrintExportType;
  printSize: PrintSize;
  resolution: PrintResolution;
  customDimensions?: {
    widthInches: number;
    heightInches: number;
  };
};

export type PrintRenderResult = {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  estimatedBytes: number;
  signedUrl: string;
  expiresAt: string;
  settings: Required<Pick<PrintRenderSettings, 'colorProfile' | 'exportType' | 'printSize' | 'resolution'>> & {
    dpi: number;
    widthPx: number;
    heightPx: number;
    bleedPx: number;
    trimPx: number;
    safeZonePx: number;
  };
};

export const printShopPresets: PrintShopPreset[] = [
  { id: '5x7', label: '5 x 7', widthInches: 5, heightInches: 7, bleedInches: 0.125, trimInches: 0.0625, safeZoneInches: 0.25 },
  { id: '8x10', label: '8 x 10', widthInches: 8, heightInches: 10, bleedInches: 0.125, trimInches: 0.0625, safeZoneInches: 0.25 },
  { id: '11x14', label: '11 x 14', widthInches: 11, heightInches: 14, bleedInches: 0.125, trimInches: 0.0625, safeZoneInches: 0.25 },
  { id: '12x12', label: '12 x 12 Scrapbook', widthInches: 12, heightInches: 12, bleedInches: 0.125, trimInches: 0.0625, safeZoneInches: 0.25 },
  { id: 'a4', label: 'A4', widthInches: 8.27, heightInches: 11.69, bleedInches: 0.125, trimInches: 0.0625, safeZoneInches: 0.25 },
  { id: 'custom', label: 'Custom', widthInches: 8, heightInches: 10, bleedInches: 0.125, trimInches: 0.0625, safeZoneInches: 0.25 },
];

export const printResolutionOptions: PrintResolutionSettings[] = [
  { id: '1080p', label: '1080p', dpi: 144, widthPx: 1920, heightPx: 1080 },
  { id: '4k', label: '4K', dpi: 216, widthPx: 3840, heightPx: 2160 },
  { id: 'print-300', label: 'Print 300 DPI', dpi: 300 },
  { id: 'ultra-print-600', label: 'Ultra Print 600 DPI', dpi: 600 },
];

const temporaryExports = new Map<string, PrintRenderResult>();

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPrintPreset(printSize: PrintSize, customDimensions?: PrintRenderSettings['customDimensions']) {
  const preset = printShopPresets.find((item) => item.id === printSize) ?? printShopPresets[1];
  if (printSize === 'custom' && customDimensions) {
    return { ...preset, ...customDimensions };
  }

  return preset;
}

export function getResolutionSettings(resolution: PrintResolution) {
  return printResolutionOptions.find((item) => item.id === resolution) ?? printResolutionOptions[2];
}

export function resolvePrintDimensions(settings: PrintRenderSettings) {
  const preset = getPrintPreset(settings.printSize, settings.customDimensions);
  const resolution = getResolutionSettings(settings.resolution);
  const widthPx = resolution.widthPx ?? Math.round((preset.widthInches + preset.bleedInches * 2) * resolution.dpi);
  const heightPx = resolution.heightPx ?? Math.round((preset.heightInches + preset.bleedInches * 2) * resolution.dpi);

  return {
    dpi: resolution.dpi,
    widthPx,
    heightPx,
    bleedPx: Math.round(preset.bleedInches * resolution.dpi),
    trimPx: Math.round(preset.trimInches * resolution.dpi),
    safeZonePx: Math.round(preset.safeZoneInches * resolution.dpi),
  };
}

export function estimatePrintFileSize(settings: PrintRenderSettings, pageCount = 1) {
  const dimensions = resolvePrintDimensions(settings);
  const rawBytes = dimensions.widthPx * dimensions.heightPx * 4 * pageCount;
  const compressionFactor = settings.exportType === 'png' ? 0.42 : 0.28;
  return Math.round(rawBytes * compressionFactor);
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
