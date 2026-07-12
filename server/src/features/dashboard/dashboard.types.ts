import type { ScanType } from '../history/history.types';

export interface DashboardStats {
  totalScans: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

export interface DashboardScanTypes {
  url: number;
  email: number;
  sms: number;
  qr: number;
  ocr: number;
}

export interface DashboardScan {
  _id: string;
  scanType: ScanType;
  input: string;
  riskScore: number;
  confidence: number;
  createdAt: Date;
}

export interface DashboardData {
  stats: DashboardStats;
  scanTypes: DashboardScanTypes;
  recentScans: DashboardScan[];
  latestHighRisk: DashboardScan[];
}
