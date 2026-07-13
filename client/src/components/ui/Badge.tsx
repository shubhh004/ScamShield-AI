import { cn } from '@/utils/cn';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'low' | 'medium' | 'high';

interface BadgeProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'bg-bg-elevated text-text-secondary border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-danger/10 text-danger border-danger/20',
};

export default function Badge({ variant = 'default', className, children }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
