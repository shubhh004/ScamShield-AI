import type { ScanType } from '../history/history.types';

export interface PromptData {
  scanType: ScanType;
  riskScore: number;
  riskLevel: string;
  reasons: string[];
  urlsFound: string[];
  emailsFound: string[];
  phoneNumbersFound: string[];
  ocrText: string | null;
}

export interface AIResponse {
  answer: string;
  tips: string[];
  provider: string;
  model: string;
}

export interface ExplainRequest {
  scanId: string;
  question?: string;
}
