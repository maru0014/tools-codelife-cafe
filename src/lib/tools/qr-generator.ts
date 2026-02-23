// QRコード生成ロジック

import QRCode from 'qrcode';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QRSize = 200 | 400 | 600;
export type OutputFormat = 'png' | 'svg';

export interface QROptions {
  size: QRSize;
  errorCorrection: ErrorCorrectionLevel;
  foregroundColor: string;
  backgroundColor: string;
}

export const defaultOptions: QROptions = {
  size: 400,
  errorCorrection: 'M',
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
};

export async function generateQRDataUrl(
  text: string,
  options: QROptions = defaultOptions
): Promise<string> {
  if (!text.trim()) return '';

  return QRCode.toDataURL(text, {
    width: options.size,
    margin: 2,
    errorCorrectionLevel: options.errorCorrection,
    color: {
      dark: options.foregroundColor,
      light: options.backgroundColor,
    },
  });
}

export async function generateQRSvg(
  text: string,
  options: QROptions = defaultOptions
): Promise<string> {
  if (!text.trim()) return '';

  return QRCode.toString(text, {
    type: 'svg',
    width: options.size,
    margin: 2,
    errorCorrectionLevel: options.errorCorrection,
    color: {
      dark: options.foregroundColor,
      light: options.backgroundColor,
    },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSvg(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}
