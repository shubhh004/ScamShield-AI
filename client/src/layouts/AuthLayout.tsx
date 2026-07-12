import { Outlet, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Shield } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function AuthLayout(): JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18), transparent)',
        }}
      />

      <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold text-text-primary">ScamShield AI</span>
      </Link>

      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <Toaster theme="dark" position="top-right" richColors />
    </div>
  );
}
