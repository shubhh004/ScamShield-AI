import type { RiskAssessment, RiskLevel } from './risk.types';

const SUSPICIOUS_TLDS = new Set(['.xyz', '.top', '.click', '.tk', '.gq']);

// Matches bare IPv4 addresses; IPv6 is wrapped in brackets by the URL parser
const IPV4_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function isIpHost(hostname: string): boolean {
  return IPV4_RE.test(hostname) || hostname.startsWith('[');
}

function extractTld(hostname: string): string {
  const dot = hostname.lastIndexOf('.');
  return dot === -1 ? '' : hostname.slice(dot);
}

function countSubdomains(hostname: string): number {
  // [sld, tld] = 0 subdomains; each additional label is one subdomain
  return Math.max(0, hostname.split('.').length - 2);
}

function toRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  return 'HIGH';
}

export function assessRisk(normalizedUrl: string): RiskAssessment {
  const { hostname } = new URL(normalizedUrl);

  let score = 0;
  const reasons: string[] = [];

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

  const riskScore = Math.min(100, score);
  return { riskScore, riskLevel: toRiskLevel(riskScore), reasons };
}
