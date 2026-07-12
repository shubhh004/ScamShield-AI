import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import { assessRisk } from '../scan-url/risk.engine';
import type { ScanEmailInput } from './scan-email.schema';
import type { ScanEmailResult, ScannedUrl } from './scan-email.types';
import type { RiskLevel } from '../scan-url/risk.types';

// ── Constants ──────────────────────────────────────────────────────────────────

const URGENCY_WORDS = [
  'urgent', 'immediately', 'act now', 'limited time', 'expires', 'verify now',
  'suspended', 'locked', 'unusual activity', 'action required', 'account suspended',
];

const REWARD_WORDS = [
  'winner', 'gift', 'prize', 'lottery', 'reward', 'free money',
  'you have won', 'selected for',
];

const CREDENTIAL_WORDS = [
  'verify account', 'login', 'password', 'reset password', 'confirm account',
  'enter your otp', 'one-time password', 'click to verify', 'update your credentials',
];

const FINANCIAL_WORDS = [
  'bank', 'upi', 'credit card', 'payment', 'refund',
  'crypto', 'bitcoin', 'wallet', 'btc', 'ethereum',
];

const ATTACHMENT_WORDS = [
  'open attachment', 'see attached', 'download the file',
  'attached document', 'invoice attached', 'click the file',
];

const SUSPICIOUS_SENDER_LOCALS = [
  'support', 'security', 'admin', 'no-reply', 'noreply',
  'help', 'service', 'info', 'alert',
];

// Free webmail domains — banks and financial services never send from these
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'rediffmail.com', 'ymail.com', 'protonmail.com',
]);

// Keywords that indicate the email is claiming to be from a bank or financial institution
const BANK_INDICATOR_WORDS = [
  'sbi', 'hdfc', 'icici', 'axis bank', 'kotak', 'your bank account',
  'bank statement', 'kyc update', 'account verification', 'bank verification',
];

const WELL_KNOWN_DOMAINS = new Set([
  'google.com', 'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
  'paypal.com', 'amazon.com', 'microsoft.com', 'apple.com', 'facebook.com',
  'instagram.com', 'netflix.com', 'github.com', 'twitter.com', 'linkedin.com',
  'salesforce.com', 'shopify.com', 'stripe.com',
]);

// Matches http/https URLs; excludes common trailing punctuation via character class
const URL_RE = /https?:\/\/[^\s<>"'()[\]]+/gi;

// ── Helpers ────────────────────────────────────────────────────────────────────

function toRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 49) return 'MEDIUM';
  return 'HIGH';
}

function containsAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function extractUrls(body: string): string[] {
  const raw = body.match(URL_RE) ?? [];
  const valid: string[] = [];
  for (const match of raw) {
    // Strip trailing punctuation that is not part of the URL
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

function getSenderLocal(email: string): string {
  return (email.split('@')[0] ?? '').toLowerCase();
}

function getSenderDomain(email: string): string {
  return (email.split('@')[1] ?? '').toLowerCase();
}

// ── Service ────────────────────────────────────────────────────────────────────

export async function initiateEmailScan(input: ScanEmailInput): Promise<ScanEmailResult> {
  const scanId = randomUUID();

  // Combine subject + body for keyword matching (subject optional)
  const fullText = [(input.subject ?? ''), input.body].join(' ').toLowerCase();
  const senderLower = input.sender.toLowerCase();

  let score = 0;
  const reasons: string[] = [];

  // Rule 1: Urgency language (+20)
  if (containsAny(fullText, URGENCY_WORDS)) {
    score += 20;
    reasons.push('Urgency language');
  }

  // Rule 2: Prize or reward bait (+20)
  if (containsAny(fullText, REWARD_WORDS)) {
    score += 20;
    reasons.push('Prize or reward bait');
  }

  // Rule 3: Credential theft keywords (+30)
  if (containsAny(fullText, CREDENTIAL_WORDS)) {
    score += 30;
    reasons.push('Credential harvesting');
  }

  // Rule 4: Financial or crypto keywords (+20)
  if (containsAny(fullText, FINANCIAL_WORDS)) {
    score += 20;
    reasons.push('Financial keywords');
  }

  // Rule 5: Attachment lure (+15)
  if (containsAny(fullText, ATTACHMENT_WORDS)) {
    score += 15;
    reasons.push('Attachment lure');
  }

  // Rule 6: Suspicious sender local part + non-well-known domain (+20)
  const senderLocal = getSenderLocal(senderLower);
  const senderDomain = getSenderDomain(senderLower);
  if (SUSPICIOUS_SENDER_LOCALS.includes(senderLocal) && !WELL_KNOWN_DOMAINS.has(senderDomain)) {
    score += 20;
    reasons.push('Suspicious sender');
  }

  // Rule 7: Free webmail domain pretending to be a bank or financial institution (+20)
  if (FREE_EMAIL_DOMAINS.has(senderDomain) && containsAny(fullText, BANK_INDICATOR_WORDS)) {
    score += 20;
    reasons.push('Free email domain impersonating a bank or institution');
  }

  // Rule 8: Extract URLs from body and assess each with the URL risk engine
  const extractedUrls = extractUrls(input.body);
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

  // Boost overall score based on highest-risk URL found in body
  const maxUrlScore = urlsFound.reduce((max, u) => Math.max(max, u.riskScore), 0);
  if (maxUrlScore >= 50) {
    score += 25;
    reasons.push('High-risk URL in email body');
  } else if (maxUrlScore >= 21) {
    score += 10;
    reasons.push('Suspicious URL in email body');
  }

  const riskScore = Math.min(100, score);
  const riskLevel = toRiskLevel(riskScore);

  logger.info('Email scan complete', { scanId, sender: input.sender, riskScore, riskLevel });

  return { scanId, riskScore, riskLevel, reasons, urlsFound };
}
