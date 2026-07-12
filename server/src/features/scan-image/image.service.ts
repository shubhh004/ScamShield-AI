import { createWorker } from 'tesseract.js';
import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import { initiateUrlScan } from '../scan-url/url.service';
import { initiateEmailScan } from '../scan-email/scan-email.service';
import { initiateSmsScan } from '../scan-sms/sms.service';
import type { ScanUrlResult } from '../scan-url/url.types';
import type { ScanEmailResult } from '../scan-email/scan-email.types';
import type { SmsScanResult } from '../scan-sms/sms.types';
import type { RiskLevel } from '../scan-url/risk.types';
import type { ImageScanResult, OcrData, Recommendation } from './image.types';

// ── Regexes ───────────────────────────────────────────────────────────────────

const URL_RE = /https?:\/\/[^\s<>"'()[\]]+/gi;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(?:\+91[\s-]?[6-9]\d{9}|0[6-9]\d{9}|\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,5}[\s-]?\d{4,6}|(?<![A-Za-z0-9])[6-9]\d{9}(?![A-Za-z0-9]))/g;

// ── OCR extraction helpers ────────────────────────────────────────────────────

function extractUrls(text: string): string[] {
  const raw = text.match(URL_RE) ?? [];
  const valid: string[] = [];
  for (const match of raw) {
    const cleaned = match.replace(/[.,;:!?]+$/, '');
    try {
      new URL(cleaned);
      valid.push(cleaned);
    } catch {
      // skip unparseable
    }
  }
  return [...new Set(valid)];
}

function extractEmails(text: string): string[] {
  const raw = text.match(EMAIL_RE) ?? [];
  return [...new Set(raw.map((e) => e.toLowerCase()))];
}

function extractPhoneNumbers(text: string): string[] {
  const raw = text.match(PHONE_RE) ?? [];
  return [...new Set(raw.map((p) => p.replace(/\s+/g, ' ').trim()))];
}

function extractOtp(text: string): string[] {
  const re = /\b(?:otp|pin|passcode|code|verification)\s*[:\-–]?\s*(\d{4,8})\b/gi;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = m[1];
    if (code !== undefined) found.add(code);
  }
  return [...found];
}

// ── Risk helpers ──────────────────────────────────────────────────────────────

function toRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 49) return 'MEDIUM';
  return 'HIGH';
}

const RECOMMENDATION: Record<RiskLevel, Recommendation> = {
  LOW: 'Looks Safe',
  MEDIUM: 'Review Carefully',
  HIGH: 'Potential Scam',
};

// ── Scanner orchestration ─────────────────────────────────────────────────────

async function runUrlScan(urls: string[]): Promise<ScanUrlResult | null> {
  if (urls.length === 0) return null;

  const results = await Promise.all(urls.map((url) => initiateUrlScan({ url })));
  return results.reduce((worst, current) =>
    current.riskScore > worst.riskScore ? current : worst,
  );
}

async function runEmailScan(
  emails: string[],
  body: string,
): Promise<ScanEmailResult | null> {
  if (emails.length === 0) return null;

  const firstEmail = emails[0];
  if (firstEmail === undefined) return null;

  return initiateEmailScan({
    sender: firstEmail,
    body: body.slice(0, 10000),
  });
}

async function runSmsScan(text: string): Promise<SmsScanResult | null> {
  const message = text.slice(0, 1600).trim();
  if (message.length < 5) return null;

  return initiateSmsScan({ message });
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function initiateImageScan(buffer: Buffer): Promise<ImageScanResult> {
  const scanId = randomUUID();

  // Step 1 — OCR
  const worker = await createWorker('eng', 1, { logger: () => undefined });
  let extractedText = '';
  try {
    const { data } = await worker.recognize(buffer);
    extractedText = data.text.trim();
  } finally {
    await worker.terminate();
  }

  logger.info('Image OCR complete', { scanId, chars: extractedText.length });

  // Step 2 — Entity extraction
  const ocr: OcrData = {
    extractedText,
    urlsFound: extractUrls(extractedText),
    emailsFound: extractEmails(extractedText),
    phoneNumbersFound: extractPhoneNumbers(extractedText),
    otpFound: extractOtp(extractedText),
  };

  // Step 3 — Run applicable scanners in parallel
  const [urlScan, emailScan, smsScan] = await Promise.all([
    runUrlScan(ocr.urlsFound),
    runEmailScan(ocr.emailsFound, extractedText),
    runSmsScan(extractedText),
  ]);

  logger.info('Image threat analysis complete', {
    scanId,
    urlScan: urlScan !== null,
    emailScan: emailScan !== null,
    smsScan: smsScan !== null,
  });

  // Step 4 — Merge risk scores
  const scores: number[] = [];
  if (urlScan !== null) scores.push(urlScan.riskScore);
  if (emailScan !== null) scores.push(emailScan.riskScore);
  if (smsScan !== null) scores.push(smsScan.riskScore);

  const overallScore = scores.length > 0 ? Math.max(...scores) : 0;
  const overallRisk = toRiskLevel(overallScore);

  const confidences: number[] = [];
  if (urlScan !== null) confidences.push(urlScan.confidence);
  if (smsScan !== null) confidences.push(smsScan.confidence);
  const overallConfidence = confidences.length > 0 ? Math.max(...confidences) : 20;

  return {
    scanId,
    ocr,
    urlScan,
    emailScan,
    smsScan,
    overallRisk,
    overallConfidence,
    recommendation: RECOMMENDATION[overallRisk],
  };
}
