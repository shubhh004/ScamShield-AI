import type { RiskLevel } from '../scan-url/risk.types';

export interface ScannedUrl {
  url: string;
  normalizedUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}

export interface SmsScanResult {
  scanId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
  urlsFound: ScannedUrl[];
  phoneNumbersFound: string[];
}
