import { Download, FileImage, FileText, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { TemplateRenderData } from './TemplateEngine';
import type { PrintExportType, PrintResolution, PrintSize } from '../models/keepsake';
import { estimatePrintFileSize, printResolutionOptions, printShopPresets } from '../services/PrintEngine';
import type { PrintRenderResult, PrintRenderSettings } from '../services/PrintEngine';
import { usePrintEngine } from '../hooks/usePrintEngine';

type ExportDialogProps = {
  data: TemplateRenderData;
  isOpen: boolean;
  onClose: () => void;
  onExported?: (result: PrintRenderResult, settings: PrintRenderSettings) => void;
  templateId: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ExportDialog({ data, isOpen, onClose, onExported, templateId }: ExportDialogProps) {
  const [exportType, setExportType] = useState<PrintExportType>('png');
  const [resolution, setResolution] = useState<PrintResolution>('print-300');
  const [printSize, setPrintSize] = useState<PrintSize>('8x10');
  const [colorProfile, setColorProfile] = useState<'srgb' | 'cmyk-safe'>('cmyk-safe');
  const printEngine = usePrintEngine();

  const settings = useMemo<PrintRenderSettings>(
    () => ({
      colorProfile,
      exportType,
      printSize,
      resolution,
    }),
    [colorProfile, exportType, printSize, resolution],
  );
  const estimatedSize = estimatePrintFileSize(settings);

  if (!isOpen) {
    return null;
  }

  async function handleExport() {
    const result = await printEngine.renderPage({ data, settings, templateId });
    if (result) {
      onExported?.(result, settings);
    }
  }

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/45 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true">
      <section className="ks-card max-h-[92vh] w-full max-w-2xl overflow-auto p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-keepsake-accentStrong">Print Export</p>
            <h2 className="mt-2 font-heading text-4xl font-bold text-keepsake-ink">Prepare a print-ready file.</h2>
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-keepsake-cream text-keepsake-ink" type="button" onClick={onClose} aria-label="Close export dialog">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-keepsake-ink">Export type</span>
            <select className="min-h-12 rounded-2xl bg-keepsake-cream px-4 font-bold text-keepsake-ink" value={exportType} onChange={(event) => setExportType(event.target.value as PrintExportType)}>
              <option value="png">PNG</option>
              <option value="pdf-page">PDF single page</option>
              <option value="pdf-album">PDF album</option>
            </select>
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Resolution</span>
              <select className="min-h-12 rounded-2xl bg-keepsake-cream px-4 font-bold text-keepsake-ink" value={resolution} onChange={(event) => setResolution(event.target.value as PrintResolution)}>
                {printResolutionOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-keepsake-ink">Print size</span>
              <select className="min-h-12 rounded-2xl bg-keepsake-cream px-4 font-bold text-keepsake-ink" value={printSize} onChange={(event) => setPrintSize(event.target.value as PrintSize)}>
                {printShopPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-keepsake-ink">Color profile</span>
            <select className="min-h-12 rounded-2xl bg-keepsake-cream px-4 font-bold text-keepsake-ink" value={colorProfile} onChange={(event) => setColorProfile(event.target.value as 'srgb' | 'cmyk-safe')}>
              <option value="cmyk-safe">CMYK-safe</option>
              <option value="srgb">sRGB digital</option>
            </select>
          </label>

          <div className="grid gap-3 rounded-keepsake bg-keepsake-cream p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-keepsake-ink">
              {exportType === 'png' ? <FileImage size={17} aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />}
              Estimated file size: {formatBytes(estimatedSize)}
            </p>
            <p className="text-sm font-semibold text-keepsake-muted">
              Includes bleed, trim, safe-zone metadata, high-resolution dimensions, and a temporary signed download URL.
            </p>
          </div>

          {printEngine.result ? (
            <div className="rounded-keepsake bg-keepsake-blush p-4">
              <p className="font-bold text-keepsake-ink">{printEngine.result.fileName}</p>
              <p className="mt-1 text-sm font-semibold text-keepsake-muted">
                Signed URL: {printEngine.result.signedUrl} · expires {new Date(printEngine.result.expiresAt).toLocaleTimeString()}
              </p>
            </div>
          ) : null}

          {printEngine.error ? <p className="text-sm font-bold text-keepsake-roseDeep">{printEngine.error}</p> : null}

          <button className="ks-button-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-extrabold" type="button" onClick={() => void handleExport()}>
            <Download size={17} aria-hidden="true" />
            {printEngine.isRendering ? 'Rendering...' : 'Render export'}
          </button>
        </div>
      </section>
    </div>
  );
}
