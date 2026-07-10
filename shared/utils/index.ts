import type { RiskCategory } from '../constants/index';
import { RISK_SCORE_THRESHOLDS } from '../constants/index';

export function scoreToCategory(score: number): RiskCategory {
  if (score <= RISK_SCORE_THRESHOLDS.SAFE_MAX) return 'safe';
  if (score <= RISK_SCORE_THRESHOLDS.LOW_MAX) return 'low';
  if (score <= RISK_SCORE_THRESHOLDS.MEDIUM_MAX) return 'medium';
  if (score <= RISK_SCORE_THRESHOLDS.HIGH_MAX) return 'high';
  return 'critical';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatIsoDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
