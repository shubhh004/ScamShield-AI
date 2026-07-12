export type ScanType = 'url' | 'email' | 'sms' | 'qr' | 'ocr';
export type RiskFilter = 'LOW' | 'MEDIUM' | 'HIGH';

export interface HistoryEntry {
  _id: string;
  scanType: ScanType;
  input: string;
  result: Record<string, unknown>;
  riskScore: number;
  confidence: number;
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HistoryQueryParams {
  page?: number;
  limit?: number;
  risk?: RiskFilter;
  type?: ScanType;
  sort?: 'asc' | 'desc';
}
