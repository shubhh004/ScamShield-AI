import type { RiskLevel } from '../scan-url/risk.types';

export interface ScannedUrl {
  url: string;
  normalizedUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}

export interface ScanEmailResult {
  scanId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  urlsFound: ScannedUrl[];
}
