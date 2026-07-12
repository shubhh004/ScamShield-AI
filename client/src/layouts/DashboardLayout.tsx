import { Outlet, useMatches } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from '@/components/ui/Sidebar';
import Topbar from '@/components/ui/Topbar';

type RouteHandle = { title?: string };

export default function DashboardLayout(): JSX.Element {
  const matches = useMatches();
  const titles = matches
    .filter((m) => (m.handle as RouteHandle | undefined)?.title !== undefined)
    .map((m) => (m.handle as RouteHandle).title);
  const title = titles[titles.length - 1];

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}
