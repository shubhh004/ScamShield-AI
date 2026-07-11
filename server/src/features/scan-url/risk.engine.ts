import type { RiskAssessment, RiskLevel } from './risk.types';

// ── Constants ──────────────────────────────────────────────────────────────────

const SUSPICIOUS_TLDS = new Set(['.xyz', '.top', '.click', '.tk', '.gq']);

const BRANDS = [
  'google', 'paypal', 'amazon', 'microsoft', 'apple', 'facebook',
  'instagram', 'netflix', 'whatsapp', 'telegram', 'bank', 'upi',
  'sbi', 'hdfc', 'icici',
];

const SUSPICIOUS_KEYWORDS = [
  'login', 'signin', 'verify', 'secure', 'update', 'password',
  'confirm', 'account', 'gift', 'reward', 'prize', 'wallet', 'bank', 'payment',
];

const URL_SHORTENERS = new Set(['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rb.gy', 'cutt.ly']);

// Matches bare IPv4 addresses; IPv6 is wrapped in brackets by the URL parser
const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const NON_ASCII_RE = /[^\x00-\x7F]/;

// ── Helpers ────────────────────────────────────────────────────────────────────

function isIpHost(hostname: string): boolean {
  return IPV4_RE.test(hostname) || hostname.startsWith('[');
}

function extractTld(hostname: string): string {
  const dot = hostname.lastIndexOf('.');
  return dot === -1 ? '' : hostname.slice(dot);
}

function getSld(hostname: string): string {
  const parts = hostname.split('.');
  return parts.length >= 2 ? (parts[parts.length - 2] ?? '') : hostname;
}

function countSubdomains(hostname: string): number {
  // [sld, tld] = 0 subdomains; each additional label is one subdomain
  return Math.max(0, hostname.split('.').length - 2);
}

function toRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 49) return 'MEDIUM';
  return 'HIGH';
}

// Piecewise linear: anchored at (0→20), (20→20), (40→55), (70→95), (100→100)
function toConfidence(score: number): number {
  if (score <= 20) return 20;
  if (score <= 40) return Math.round(20 + (score - 20) * 1.75);
  if (score <= 70) return Math.round(55 + (score - 40) * (40 / 30));
  return Math.min(100, Math.round(95 + (score - 70) * (5 / 30)));
}

// ── Engine ─────────────────────────────────────────────────────────────────────

export function assessRisk(normalizedUrl: string, rawUrl = normalizedUrl): RiskAssessment {
  const { hostname, pathname, protocol } = new URL(normalizedUrl);

  let score = 0;
  const reasons: string[] = [];

  // ── Sprint 3B rules ──────────────────────────────────────────────────────────

  // Rule 1: IP address as host (+30)
  if (isIpHost(hostname)) {
    score += 30;
    reasons.push('IP address used as host');
  }

  // Rule 2: URL length > 100 (+15)
  if (normalizedUrl.length > 100) {
    score += 15;
    reasons.push('Unusually long URL');
  }

  // Rule 3: Suspicious TLD (+20)
  const tld = extractTld(hostname);
  if (SUSPICIOUS_TLDS.has(tld)) {
    score += 20;
    reasons.push(`Suspicious top-level domain: ${tld}`);
  }

  // Rule 4: '@' in URL — classic userinfo phishing trick (+25)
  if (normalizedUrl.includes('@')) {
    score += 25;
    reasons.push('URL contains "@" character');
  }

  // Rule 5: More than 3 subdomains (+15); skip IP hosts — they have no subdomains
  if (!isIpHost(hostname) && countSubdomains(hostname) > 3) {
    score += 15;
    reasons.push('Excessive number of subdomains');
  }

  // ── Sprint 3C rules ──────────────────────────────────────────────────────────

  // Rule 6: Punycode domain (+25)
  if (hostname.includes('xn--')) {
    score += 25;
    reasons.push('Punycode domain detected');
  }

  // Rule 7: Brand impersonation (+20)
  // Fires when a brand name appears in hostname/path but is NOT the actual SLD
  const sld = getSld(hostname);
  const brandTarget = (hostname + pathname).toLowerCase();
  const matchedBrand = BRANDS.find((brand) => brandTarget.includes(brand) && sld !== brand);
  if (matchedBrand !== undefined) {
    score += 20;
    reasons.push('Brand impersonation');
  }

  // Rule 8: Suspicious keywords (+10 each, max +30)
  const kwTarget = (hostname + pathname).toLowerCase();
  const matchedKeywords = SUSPICIOUS_KEYWORDS.filter((kw) => kwTarget.includes(kw));
  score += Math.min(30, matchedKeywords.length * 10);
  matchedKeywords.forEach((kw) => reasons.push(`Suspicious keyword: ${kw}`));

  // Rule 9: Unicode (homograph) hostname — check raw URL before punycode normalisation (+25)
  const rawHostMatch = /^https?:\/\/([^/?#@:[\]]+)/i.exec(rawUrl);
  const rawHost = rawHostMatch?.[1] ?? '';
  if (NON_ASCII_RE.test(rawHost)) {
    score += 25;
    reasons.push('Unicode hostname');
  }

  // Rule 10: URL shortener (+15)
  if (URL_SHORTENERS.has(hostname)) {
    score += 15;
    reasons.push('URL shortener');
  }

  // Rule 11: HTTPS (-5, floor at 0)
  if (protocol === 'https:') {
    score = Math.max(0, score - 5);
    reasons.push('HTTPS detected');
  }

  const riskScore = Math.min(100, score);
  return { riskScore, riskLevel: toRiskLevel(riskScore), confidence: toConfidence(riskScore), reasons };
}
