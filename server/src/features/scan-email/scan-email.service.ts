import { randomUUID } from 'crypto';
import { logger } from '../../config/logger';
import { assessRisk } from '../scan-url/risk.engine';
import type { ScanEmailInput } from './scan-email.schema';
import type { ScanEmailResult, ScannedUrl } from './scan-email.types';
import type { RiskLevel } from '../scan-url/risk.types';

// ── Constants ──────────────────────────────────────────────────────────────────

const URGENCY_WORDS = ['urgent', 'immediately', 'act now', 'limited time', 'expires', 'verify now'];

const REWARD_WORDS = ['winner', 'gift', 'prize', 'lottery', 'reward', 'free money'];

const CREDENTIAL_WORDS = ['verify account', 'login', 'password', 'reset password', 'confirm account'];

const FINANCIAL_WORDS = ['bank', 'upi', 'credit card', 'payment', 'refund'];

const SUSPICIOUS_SENDER_LOCALS = ['support', 'security', 'admin', 'no-reply'];

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

  // Rule 1: Urgency words (+20)
  if (containsAny(fullText, URGENCY_WORDS)) {
    score += 20;
    reasons.push('Urgency language');
  }

  // Rule 2: Reward words (+20)
  if (containsAny(fullText, REWARD_WORDS)) {
    score += 20;
    reasons.push('Reward bait');
  }

  // Rule 3: Credential theft keywords (+25)
  if (containsAny(fullText, CREDENTIAL_WORDS)) {
    score += 25;
    reasons.push('Credential harvesting');
  }

  // Rule 4: Financial keywords (+15)
  if (containsAny(fullText, FINANCIAL_WORDS)) {
    score += 15;
    reasons.push('Financial keywords');
  }

  // Rule 5: Suspicious sender local part + non-well-known domain (+20)
  const senderLocal = getSenderLocal(senderLower);
  const senderDomain = getSenderDomain(senderLower);
  if (SUSPICIOUS_SENDER_LOCALS.includes(senderLocal) && !WELL_KNOWN_DOMAINS.has(senderDomain)) {
    score += 20;
    reasons.push('Suspicious sender');
  }

  // Rule 6: Extract URLs from body and assess each with the URL risk engine
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

  const riskScore = Math.min(100, score);
  const riskLevel = toRiskLevel(riskScore);

  logger.info('Email scan complete', { scanId, sender: input.sender, riskScore, riskLevel });

  return { scanId, riskScore, riskLevel, reasons, urlsFound };
}
