import type { RiskLevel } from './risk.types';

export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ScanUrlResult {
  scanId: string;
  url: string;
  normalizedUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}
