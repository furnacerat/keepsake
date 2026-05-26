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
