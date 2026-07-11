import type { RiskLevel } from '../scan-url/risk.types';

export interface FileScanInput {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileScanResult {
  scanId: string;
  filename: string;
  extension: string;
  mimeType: string;
  size: number;
  sha256: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}
