export const RISK_CATEGORIES = ['safe', 'low', 'medium', 'high', 'critical'] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const SCAN_TYPES = ['url', 'email', 'sms', 'image', 'qr'] as const;
export type ScanType = (typeof SCAN_TYPES)[number];

export const SCAN_STATUSES = ['queued', 'processing', 'completed', 'failed'] as const;
export type ScanStatus = (typeof SCAN_STATUSES)[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const RISK_SCORE_THRESHOLDS = {
  SAFE_MAX: 20,
  LOW_MAX: 40,
  MEDIUM_MAX: 60,
  HIGH_MAX: 80,
} as const;
