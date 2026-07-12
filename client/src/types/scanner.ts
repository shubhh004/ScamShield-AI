export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ScanUrlResult {
  scanId: string;
  url: string;
  normalizedUrl: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
}

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

export interface SmsScanResult {
  scanId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
  urlsFound: ScannedUrl[];
  phoneNumbersFound: string[];
}

export interface QrScanResult {
  type: 'url' | 'text';
  decoded: string;
  scan: ScanUrlResult | null;
}

export interface OcrData {
  extractedText: string;
  urlsFound: string[];
  emailsFound: string[];
  phoneNumbersFound: string[];
  otpFound: string[];
}

export interface ImageScanResult {
  scanId: string;
  ocr: OcrData;
  urlScan: ScanUrlResult | null;
  emailScan: ScanEmailResult | null;
  smsScan: SmsScanResult | null;
  overallRisk: RiskLevel;
  overallConfidence: number;
  recommendation: 'Looks Safe' | 'Review Carefully' | 'Potential Scam';
}
