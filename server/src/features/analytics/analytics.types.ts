export interface RiskBucket {
  count: number;
  percentage: number;
}

export interface RiskDistribution {
  low: RiskBucket;
  medium: RiskBucket;
  high: RiskBucket;
}

export interface ScanTypeDistribution {
  url: number;
  email: number;
  sms: number;
  qr: number;
  ocr: number;
}

export interface DailyScan {
  date: string;
  count: number;
}

export interface ThreatReason {
  reason: string;
  count: number;
}

export interface AnalyticsData {
  todayScans: number;
  weekScans: number;
  monthScans: number;
  riskDistribution: RiskDistribution;
  scanTypeDistribution: ScanTypeDistribution;
  weeklyScans: DailyScan[];
  topThreatReasons: ThreatReason[];
}
