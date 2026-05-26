import { useCallback, useState } from 'react';
import type { TemplateRenderData } from '../components/TemplateEngine';
import type { Keepsake } from '../models/keepsake';
import type { PrintRenderResult, PrintRenderSettings } from '../services/printSettings';

export function usePrintEngine() {
  const [isRendering, setIsRendering] = useState(false);
  const [result, setResult] = useState<PrintRenderResult>();
  const [error, setError] = useState<string>();

  const renderPage = useCallback(
    async ({
      data,
      settings,
      templateId,
    }: {
      data: TemplateRenderData;
      settings: PrintRenderSettings;
      templateId: string;
    }) => {
      setIsRendering(true);
      setError(undefined);
      try {
        const { renderPrintExport } = await import('../services/PrintEngine');
        const nextResult = await renderPrintExport({ data, settings, templateId });
        setResult(nextResult);
        return nextResult;
      } catch (renderError) {
        setError(renderError instanceof Error ? renderError.message : 'Unable to render export.');
        return undefined;
      } finally {
        setIsRendering(false);
      }
    },
    [],
  );

  const renderAlbum = useCallback(
    async ({
      keepsakes,
      settings,
      title,
    }: {
      keepsakes: Keepsake[];
      settings: Omit<PrintRenderSettings, 'exportType'>;
      title?: string;
    }) => {
      setIsRendering(true);
      setError(undefined);
      try {
        const { renderAlbumExport } = await import('../services/AlbumExport');
        const nextResult = await renderAlbumExport({ keepsakes, settings, title });
        setResult(nextResult);
        return nextResult;
      } catch (renderError) {
        setError(renderError instanceof Error ? renderError.message : 'Unable to render album.');
        return undefined;
      } finally {
        setIsRendering(false);
      }
    },
    [],
  );

  return {
    error,
    isRendering,
    renderAlbum,
    renderPage,
    result,
  };
}
