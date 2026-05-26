import { describe, expect, it } from 'vitest';
import type { Keepsake } from '../models/keepsake';
import { renderAlbumExport } from './AlbumExport';
import { estimatePrintFileSize, resolvePrintDimensions } from './PrintEngine';

describe('PrintEngine', () => {
  it('resolves 300 DPI print dimensions with bleed and safe zones', () => {
    const dimensions = resolvePrintDimensions({
      colorProfile: 'cmyk-safe',
      exportType: 'png',
      printSize: '8x10',
      resolution: 'print-300',
    });

    expect(dimensions.dpi).toBe(300);
    expect(dimensions.widthPx).toBe(2475);
    expect(dimensions.heightPx).toBe(3075);
    expect(dimensions.bleedPx).toBe(38);
    expect(dimensions.safeZonePx).toBe(75);
  });

  it('estimates larger files for ultra print settings', () => {
    const standard = estimatePrintFileSize({
      colorProfile: 'cmyk-safe',
      exportType: 'png',
      printSize: '8x10',
      resolution: 'print-300',
    });
    const ultra = estimatePrintFileSize({
      colorProfile: 'cmyk-safe',
      exportType: 'png',
      printSize: '8x10',
      resolution: 'ultra-print-600',
    });

    expect(ultra).toBeGreaterThan(standard);
  });

  it('assembles a mocked album PDF with sequential pages', async () => {
    const keepsakes: Keepsake[] = [
      {
        id: 'one',
        ideaType: 'test',
        recipientType: 'Myself',
        title: 'Page One',
        message: 'One',
        unlockType: 'none',
        createdAt: new Date().toISOString(),
        status: 'unlocked',
      },
      {
        id: 'two',
        ideaType: 'test',
        recipientType: 'Myself',
        title: 'Page Two',
        message: 'Two',
        unlockType: 'none',
        createdAt: new Date().toISOString(),
        status: 'unlocked',
        animationStyle: 'gentleFade',
      },
    ];
    const result = await renderAlbumExport({
      keepsakes,
      settings: {
        colorProfile: 'cmyk-safe',
        printSize: '12x12',
        resolution: 'print-300',
      },
      title: 'Family Album',
    });

    expect(result.mimeType).toBe('application/pdf');
    expect(result.fileName).toBe('family-album.pdf');
    expect(result.settings.exportType).toBe('pdf-album');
    expect(result.signedUrl).toContain('/exports/');
  });
});
