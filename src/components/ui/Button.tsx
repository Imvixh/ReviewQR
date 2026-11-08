import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'desktop' | 'mobile';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'desktop', isLoading, children, disabled, ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-[#1A73E8] text-white hover:bg-[#1557B0] focus:ring-[#1A73E8]/40 shadow-sm hover:shadow',
    secondary:
      'bg-white text-[#0F172A] border border-[#CBD5E1] hover:bg-[#F8FAFC] hover:border-[#94A3B8] focus:ring-slate-300',
    destructive:
      'bg-[#FEF2F2] text-[#EA4335] border border-[#FCA5A5] hover:bg-[#FEE2E2] focus:ring-[#EA4335]/30',
    ghost:
      'bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus:ring-slate-200',
    outline:
      'border border-[#1A73E8] text-[#1A73E8] bg-transparent hover:bg-[#EFF6FF] focus:ring-[#1A73E8]/30',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-sm rounded-xl gap-2',
    lg: 'h-11 px-5 text-base rounded-xl gap-2',
    desktop: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2',
    mobile: 'h-12 px-6 text-base font-semibold rounded-xl gap-2 w-full',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});

export const ButtonPrimary = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  function ButtonPrimary(props, ref) {
    return <Button ref={ref} variant="primary" {...props} />;
  }
);

export const ButtonSecondary = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  function ButtonSecondary(props, ref) {
    return <Button ref={ref} variant="secondary" {...props} />;
  }
);

export const ButtonDestructive = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  function ButtonDestructive(props, ref) {
    return <Button ref={ref} variant="destructive" {...props} />;
  }
);
