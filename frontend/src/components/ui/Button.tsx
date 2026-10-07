import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { IconLoader2 } from '@tabler/icons-react';

export type ButtonVariant =
  'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const BASE_STYLES =
  'inline-flex items-center justify-center font-sans select-none transition-all outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-primary-light to-primary-dark text-white font-semibold border border-primary-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_1px_2px_rgba(180,20,10,0.22)] hover:brightness-95 active:brightness-90 [&_svg]:stroke-current [&_svg]:text-white',
  outline:
    'border border-primary text-primary bg-white font-medium shadow-2xs hover:bg-primary/5 active:bg-primary/10 [&_svg]:stroke-current [&_svg]:text-primary',
  secondary:
    'border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 shadow-2xs [&_svg]:stroke-current',
  ghost:
    'bg-transparent text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/70 [&_svg]:stroke-current',
  danger:
    'border border-rose-700/20 bg-rose-600 text-white font-semibold shadow-xs hover:bg-rose-700 active:bg-rose-800 [&_svg]:stroke-current [&_svg]:text-white',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-9.5 px-4 text-sm rounded-xl gap-2',
  lg: 'h-11 px-5 text-base rounded-xl gap-2.5',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg shrink-0 justify-center',
  icon: 'h-9.5 w-9.5 p-0 rounded-xl shrink-0 justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      type = 'button',
      disabled,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = size === 'icon' || size === 'icon-sm';
    const spinnerSize = size === 'sm' || size === 'icon-sm' ? 14 : 16;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${SIZE_STYLES[size]} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <IconLoader2
            size={spinnerSize}
            className="animate-spin shrink-0 text-current"
          />
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex shrink-0 items-center justify-center">
                {leftIcon}
              </span>
            )}

            {children && (
              <span
                className={
                  isIconOnly
                    ? 'inline-flex shrink-0 items-center justify-center'
                    : 'truncate'
                }
              >
                {children}
              </span>
            )}

            {rightIcon && (
              <span className="inline-flex shrink-0 items-center justify-center">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
