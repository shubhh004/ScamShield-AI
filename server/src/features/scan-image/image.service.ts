import { createWorker } from 'tesseract.js';
import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import type { ImageScanResult } from './image.types';

// ── Regexes ───────────────────────────────────────────────────────────────────

const URL_RE = /https?:\/\/[^\s<>"'()[\]]+/gi;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE =
  /(?:\+91[\s-]?[6-9]\d{9}|0[6-9]\d{9}|\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,5}[\s-]?\d{4,6}|(?<![A-Za-z0-9])[6-9]\d{9}(?![A-Za-z0-9]))/g;

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  // Context-aware: keyword followed by 4-8 digit code
  const re = /\b(?:otp|pin|passcode|code|verification)\s*[:\-–]?\s*(\d{4,8})\b/gi;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const code = m[1];
    if (code !== undefined) found.add(code);
  }
  return [...found];
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function initiateImageScan(buffer: Buffer): Promise<ImageScanResult> {
  const scanId = randomUUID();

  const worker = await createWorker('eng', 1, {
    logger: () => undefined,
  });

  let extractedText = '';
  try {
    const { data } = await worker.recognize(buffer);
    extractedText = data.text.trim();
  } finally {
    await worker.terminate();
  }

  logger.info('Image OCR complete', { scanId, chars: extractedText.length });

  return {
    scanId,
    extractedText,
    urlsFound: extractUrls(extractedText),
    emailsFound: extractEmails(extractedText),
    phoneNumbersFound: extractPhoneNumbers(extractedText),
    otpFound: extractOtp(extractedText),
  };
}
