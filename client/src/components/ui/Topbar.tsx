import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from './Button';

interface TopbarProps {
  title?: string;
}

export default function Topbar({ title }: TopbarProps): JSX.Element {
  const { user, logout } = useAuth();

  function handleLogout(): void {
    void logout();
  }

  const displayName = user?.name ?? user?.email ?? 'Account';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-card px-6">
      <div className="flex items-center gap-3">
        {title !== undefined && (
          <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="max-w-[120px] truncate text-xs font-medium text-text-secondary">
            {displayName}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
