import type { ScanUrlResult } from '../scan-url/url.types';
import type { ScanEmailResult } from '../scan-email/scan-email.types';
import type { SmsScanResult } from '../scan-sms/sms.types';
import type { RiskLevel } from '../scan-url/risk.types';

export type Recommendation = 'Looks Safe' | 'Review Carefully' | 'Potential Scam';

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
  recommendation: Recommendation;
}
