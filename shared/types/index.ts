import type { RiskCategory, ScanStatus, ScanType } from '../constants/index';

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ScanRecordSummary {
  scanId: string;
  scanType: ScanType;
  status: ScanStatus;
  riskScore: number | null;
  riskCategory: RiskCategory | null;
  createdAt: string;
}
