import type { ScanUrlResult } from '../scan-url/url.types';

export interface QrScanResult {
  type: 'url' | 'text';
  decoded: string;
  scan: ScanUrlResult | null;
}
