import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/ui/Loading';
import ProtectedRoute from '@/components/ui/ProtectedRoute';
import PublicRoute from '@/components/ui/PublicRoute';
import LandingLayout from '@/layouts/LandingLayout';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ROUTES } from '@/constants/routes';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const UrlScannerPage = lazy(() => import('@/features/url-scanner/pages/UrlScannerPage'));
const EmailScannerPage = lazy(() => import('@/features/email-scanner/pages/EmailScannerPage'));
const SmsScannerPage = lazy(() => import('@/features/sms-scanner/pages/SmsScannerPage'));
const QrScannerPage = lazy(() => import('@/features/qr-scanner/pages/QrScannerPage'));
const OcrScannerPage = lazy(() => import('@/features/ocr-scanner/pages/OcrScannerPage'));
const HistoryPage = lazy(() => import('@/features/scan-history/pages/HistoryPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing + public content */}
            <Route element={<LandingLayout />}>
              <Route path={ROUTES.HOME} element={<LandingPage />} />
              <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
              <Route path={ROUTES.TERMS} element={<TermsPage />} />
            </Route>

            {/* Auth — redirect authenticated users to dashboard */}
            <Route element={<PublicRoute />}>
              <Route element={<AuthLayout />}>
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              </Route>
            </Route>

            {/* Protected dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} handle={{ title: 'Dashboard' }} />
                <Route path={ROUTES.SCAN_URL} element={<UrlScannerPage />} handle={{ title: 'URL Scanner' }} />
                <Route path={ROUTES.SCAN_EMAIL} element={<EmailScannerPage />} handle={{ title: 'Email Scanner' }} />
                <Route path={ROUTES.SCAN_SMS} element={<SmsScannerPage />} handle={{ title: 'SMS Scanner' }} />
                <Route path={ROUTES.SCAN_QR} element={<QrScannerPage />} handle={{ title: 'QR Scanner' }} />
                <Route path={ROUTES.SCAN_IMAGE} element={<OcrScannerPage />} handle={{ title: 'Image OCR' }} />
                <Route path={ROUTES.HISTORY} element={<HistoryPage />} handle={{ title: 'History' }} />
                <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} handle={{ title: 'Analytics' }} />
                <Route path={ROUTES.SETTINGS} element={<SettingsPage />} handle={{ title: 'Settings' }} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
