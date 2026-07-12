import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import { assessRisk } from '../scan-url/risk.engine';
import type { SmsScanInput } from './sms.schema';
import type { SmsScanResult, ScannedUrl } from './sms.types';
import type { RiskLevel } from '../scan-url/risk.types';

// ── Constants ──────────────────────────────────────────────────────────────────

const URGENCY_WORDS = [
  'urgent', 'immediately', 'act now', 'last chance', 'expires today',
  'click here', 'verify now', 'limited offer',
];

const MONEY_WORDS = [
  'win', 'lottery', 'reward', 'cash', 'free', 'gift', 'prize', 'jackpot',
];

const BANK_WORDS = [
  'upi', 'bank', 'refund', 'kyc', 'credit card', 'debit card',
  'payment', 'wallet',
];

const OTP_WORDS = [
  'otp', 'verification code', 'one-time password', 'login code',
];

const CRYPTO_WORDS = [
  'crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'nft',
];

// Matches http/https URLs; trailing punctuation excluded
const URL_RE = /https?:\/\/[^\s<>"'()[\]]+/gi;

// Phone number patterns:
//   +91XXXXXXXXXX  (India with country code)
//   0XXXXXXXXXX    (India with leading zero, 10-11 digits)
//   +X…XX          (generic international, 7-15 digits after +)
//   XXXXXXXXXX     (standalone 10-digit, not preceded by alphanumeric to avoid false matches)
const PHONE_RE =
  /(?:\+91[\s-]?[6-9]\d{9}|0[6-9]\d{9}|\+\d{1,3}[\s-]?\(?\d{1,4}\)?[\s-]?\d{3,5}[\s-]?\d{4,6}|(?<![A-Za-z0-9])[6-9]\d{9}(?![A-Za-z0-9]))/g;

// ── Helpers ────────────────────────────────────────────────────────────────────

function toRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 49) return 'MEDIUM';
  return 'HIGH';
}

// LOW (0–20) → 20–50 %, MEDIUM (21–49) → 50–80 %, HIGH (50–100) → 80–99 %
function toConfidence(score: number): number {
  if (score <= 20) return Math.round(20 + score * 1.5);
  if (score <= 49) return Math.round(50 + (score - 20) * (30 / 29));
  return Math.min(99, Math.round(80 + (score - 49) * (19 / 51)));
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function extractUrls(message: string): string[] {
  const raw = message.match(URL_RE) ?? [];
  const valid: string[] = [];
  for (const match of raw) {
    const cleaned = match.replace(/[.,;:!?]+$/, '');
    try {
      new URL(cleaned);
      valid.push(cleaned);
    } catch {
      // skip unparseable matches
    }
  }
  return [...new Set(valid)];
}

function extractPhoneNumbers(message: string): string[] {
  const raw = message.match(PHONE_RE) ?? [];
  // Normalise whitespace within each match
  const normalised = raw.map((p) => p.replace(/\s+/g, ' ').trim());
  return [...new Set(normalised)];
}

// ── Service ────────────────────────────────────────────────────────────────────

export async function initiateSmsScan(input: SmsScanInput): Promise<SmsScanResult> {
  const scanId = randomUUID();
  const text = input.message.toLowerCase();

  let score = 0;
  const reasons: string[] = [];

  // Rule 1: Urgency language (+20)
  if (containsAny(text, URGENCY_WORDS)) {
    score += 20;
    reasons.push('Urgency language');
  }

  // Rule 2: Prize / reward bait (+20)
  if (containsAny(text, MONEY_WORDS)) {
    score += 20;
    reasons.push('Prize or reward bait');
  }

  // Rule 3: Banking / financial keywords (+25)
  if (containsAny(text, BANK_WORDS)) {
    score += 25;
    reasons.push('Financial keywords');
  }

  // Rule 4: OTP-related keywords (+30) — high weight; OTP stealing is a primary scam vector
  if (containsAny(text, OTP_WORDS)) {
    score += 30;
    reasons.push('OTP or verification code request');
  }

  // Rule 5: Crypto scam keywords (+25)
  if (containsAny(text, CRYPTO_WORDS)) {
    score += 25;
    reasons.push('Cryptocurrency or crypto scam keywords');
  }

  // Rule 6: Extract and score URLs
  const extractedUrls = extractUrls(input.message);
  const urlsFound: ScannedUrl[] = extractedUrls.map((url) => {
    const normalizedUrl = new URL(url).href;
    const assessment = assessRisk(normalizedUrl, url);
    return {
      url,
      normalizedUrl,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      reasons: assessment.reasons,
    };
  });

  // Boost overall score based on highest-risk URL found
  const maxUrlScore = urlsFound.reduce((max, u) => Math.max(max, u.riskScore), 0);
  if (maxUrlScore >= 50) {
    score += 25;
    reasons.push('High-risk URL in message');
  } else if (maxUrlScore >= 21) {
    score += 10;
    reasons.push('Suspicious URL in message');
  }

  // Rule 7: Phone number extraction (informational — no score impact)
  const phoneNumbersFound = extractPhoneNumbers(input.message);

  const riskScore = Math.min(100, score);
  const riskLevel = toRiskLevel(riskScore);
  const confidence = toConfidence(riskScore);

  logger.info('SMS scan complete', { scanId, riskScore, riskLevel });

  return { scanId, riskScore, riskLevel, confidence, reasons, urlsFound, phoneNumbersFound };
}
