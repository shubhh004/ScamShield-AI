import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import Button from './Button';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout(): void {
    logout();
    void navigate(ROUTES.LOGIN);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-bg-card px-6">
      <div className="flex items-center gap-3">
        {title !== undefined && (
          <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-xs font-medium text-text-secondary">
            {user?.name ?? user?.email ?? 'Account'}
          </span>
        </div>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
