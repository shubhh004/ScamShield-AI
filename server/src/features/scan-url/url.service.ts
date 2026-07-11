import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import type { ScanUrlInput } from './url.schema';
import type { ScanUrlResult } from './url.types';
import { assessRisk } from './risk.engine';

function normalizeUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  return parsed.href;
}

export async function initiateUrlScan(input: ScanUrlInput): Promise<ScanUrlResult> {
  const normalizedUrl = normalizeUrl(input.url);
  const scanId = randomUUID();

  const { riskScore, riskLevel, confidence, reasons } = assessRisk(normalizedUrl, input.url);

  logger.info('URL scan complete', { scanId, url: input.url, normalizedUrl, riskScore, riskLevel });

  return {
    scanId,
    url: input.url,
    normalizedUrl,
    riskScore,
    riskLevel,
    confidence,
    reasons,
  };
}
