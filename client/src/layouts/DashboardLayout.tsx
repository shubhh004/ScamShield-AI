import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from '@/components/ui/Sidebar';
import Topbar from '@/components/ui/Topbar';
import { ROUTES } from '@/constants/routes';

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.SCAN_URL]: 'URL Scanner',
  [ROUTES.SCAN_EMAIL]: 'Email Scanner',
  [ROUTES.SCAN_SMS]: 'SMS Scanner',
  [ROUTES.SCAN_QR]: 'QR Scanner',
  [ROUTES.SCAN_IMAGE]: 'Image OCR',
  [ROUTES.HISTORY]: 'History',
  [ROUTES.ANALYTICS]: 'Analytics',
  [ROUTES.SETTINGS]: 'Settings',
};

export default function DashboardLayout(): JSX.Element {
  const { pathname } = useLocation();
  const title = ROUTE_TITLES[pathname];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 pb-10">
          <Outlet />
        </main>
      </div>
      <Toaster theme="dark" position="bottom-right" richColors />
    </div>
  );
}
