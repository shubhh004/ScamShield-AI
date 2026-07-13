export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SCAN_URL: '/scan/url',
  SCAN_EMAIL: '/scan/email',
  SCAN_SMS: '/scan/sms',
  SCAN_QR: '/scan/qr',
  SCAN_IMAGE: '/scan/image',
  HISTORY: '/history',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  NOT_FOUND: '*',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
