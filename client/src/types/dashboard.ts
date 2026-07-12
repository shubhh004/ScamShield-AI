export type ScanType = 'url' | 'email' | 'sms' | 'qr' | 'ocr';

export interface DashboardStats {
  totalScans: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

export interface DashboardScan {
  _id: string;
  scanType: ScanType;
  input: string;
  riskScore: number;
  confidence: number;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  scanTypes: { url: number; email: number; sms: number; qr: number; ocr: number };
  recentScans: DashboardScan[];
  latestHighRisk: DashboardScan[];
}

export interface RiskBucket {
  count: number;
  percentage: number;
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
  riskDistribution: {
    low: RiskBucket;
    medium: RiskBucket;
    high: RiskBucket;
  };
  scanTypeDistribution: { url: number; email: number; sms: number; qr: number; ocr: number };
  weeklyScans: DailyScan[];
  topThreatReasons: ThreatReason[];
}
