import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from '@/components/ui/Navbar';

export default function LandingLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}
