import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps): JSX.Element {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      {icon !== undefined && (
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-bg-elevated text-text-muted">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description !== undefined && (
          <p className="text-xs text-text-muted">{description}</p>
        )}
      </div>
      {action !== undefined && action}
    </div>
  );
}
