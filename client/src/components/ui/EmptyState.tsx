import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}
    >
      {icon !== undefined && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-bg-elevated text-text-muted ring-1 ring-border/50">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description !== undefined && (
          <p className="max-w-xs text-xs leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {action !== undefined && action}
    </motion.div>
  );
}
