import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };

export function Spinner({ size = 'md', className }: SpinnerProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-primary',
        sizes[size],
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }): JSX.Element {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

export function PageLoader(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <Spinner size="lg" />
    </div>
  );
}

export function SectionLoader(): JSX.Element {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Spinner />
    </div>
  );
}
