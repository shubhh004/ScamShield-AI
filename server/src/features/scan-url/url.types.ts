export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ScanUrlResult {
  scanId: string;
  url: string;
  normalizedUrl: string;
  status: ScanStatus;
  createdAt: string;
}
