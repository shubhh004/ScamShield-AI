export const SCAN_TYPES = ['url', 'email', 'sms', 'qr', 'ocr'] as const;
export type ScanType = (typeof SCAN_TYPES)[number];

export interface HistoryListQuery {
  page?: number;
  limit?: number;
  risk?: 'LOW' | 'MEDIUM' | 'HIGH';
  type?: ScanType;
  sort?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
