import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-all duration-150 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] active:scale-[0.97] active:duration-75 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md hover:shadow-primary/20',
  secondary:
    'bg-bg-elevated hover:bg-border text-text-primary border border-border hover:border-border-subtle',
  danger:
    'bg-danger hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:shadow-danger/20',
  ghost:
    'hover:bg-bg-elevated text-text-secondary hover:text-text-primary',
  outline:
    'border border-border hover:border-border-subtle text-text-primary hover:bg-bg-elevated',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
export default Button;
