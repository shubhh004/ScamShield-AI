import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label !== undefined && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon !== undefined && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-150">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
              'transition-all duration-150 focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20',
              'hover:border-border-subtle',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none disabled:bg-bg-elevated disabled:hover:border-border',
              error !== undefined && 'border-danger/60 hover:border-danger/60 focus:border-danger/70 focus:ring-danger/20',
              leftIcon !== undefined && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error !== undefined && (
          <p className="text-xs text-danger">{error}</p>
        )}
        {error === undefined && hint !== undefined && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
