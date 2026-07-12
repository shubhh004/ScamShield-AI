export type ScanType = 'url' | 'email' | 'sms' | 'qr' | 'ocr';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ScanResult {
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  reasons: string[];
}

export interface HistoryItem {
  _id: string;
  scanType: ScanType;
  input: string;
  riskScore: number;
  confidence: number;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
