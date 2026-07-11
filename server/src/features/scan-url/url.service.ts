import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import type { ScanUrlInput } from './url.schema';
import type { ScanUrlResult } from './url.types';

function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  return parsed.href;
}

export async function initiateUrlScan(input: ScanUrlInput): Promise<ScanUrlResult> {
  const normalizedUrl = normalizeUrl(input.url);
  const scanId = randomUUID();
  const createdAt = new Date().toISOString();

  logger.info('URL scan queued', { scanId, url: input.url, normalizedUrl });

  return {
    scanId,
    url: input.url,
    normalizedUrl,
    status: 'queued',
    createdAt,
  };
}
