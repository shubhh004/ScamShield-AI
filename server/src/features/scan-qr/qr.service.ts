import { Jimp } from 'jimp';
import QrCode from 'qrcode-reader';
import { AppError } from '../../lib/errors';
import { logger } from '../../config/logger';
import { initiateUrlScan } from '../scan-url/url.service';
import type { QrScanResult } from './qr.types';

async function decodeQrFromBuffer(buffer: Buffer): Promise<string> {
  const image = await Jimp.read(buffer).catch(() => {
    throw new AppError(400, 'QR_NOT_FOUND', 'Failed to read image');
  });

  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (err, value) => {
      if (err !== null && err !== undefined) {
        reject(new AppError(400, 'QR_NOT_FOUND', 'No QR code found in image'));
        return;
      }
      if (value === null || value === undefined || !value.result) {
        reject(new AppError(400, 'QR_NOT_FOUND', 'No QR code found in image'));
        return;
      }
      resolve(value.result);
    };
    qr.decode(image.bitmap);
  });
}

function isUrl(text: string): boolean {
  try {
    const { protocol } = new URL(text);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

export async function initiateQrScan(buffer: Buffer): Promise<QrScanResult> {
  const decoded = await decodeQrFromBuffer(buffer);
  logger.info('QR code decoded', { length: decoded.length });

  if (isUrl(decoded)) {
    const scan = await initiateUrlScan({ url: decoded });
    return { type: 'url', decoded, scan };
  }

  return { type: 'text', decoded, scan: null };
}
