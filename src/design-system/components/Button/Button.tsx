import React from 'react';
import { cn } from '../../../lib/utils';
import { Button as ShadcnButton } from '../../../components/ui/button';
import type { ButtonProps as ShadcnButtonProps } from '../../../components/ui/button';

// Enhanced Button component wrapper that maintains backward compatibility
export interface ButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  /** Button variant for styling */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link' | 'default';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'default';
  /** Loading state */
  loading?: boolean;
  /** Icon to show before text */
  leftIcon?: React.ReactNode;
  /** Icon to show after text */
  rightIcon?: React.ReactNode;
}

// Map our custom variants to shadcn variants
const variantMap: Record<string, ShadcnButtonProps['variant']> = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
  danger: 'destructive',
  success: 'default', // We'll handle success styling with custom classes
  outline: 'outline',
  link: 'link',
  default: 'default',
};

// Map our custom sizes to shadcn sizes
const sizeMap: Record<string, ShadcnButtonProps['size']> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  xl: 'lg', // shadcn doesn't have xl, use lg
  icon: 'icon',
  default: 'default',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}, ref) => {
  const shadcnVariant = variantMap[variant] || 'default';
  const shadcnSize = sizeMap[size] || 'default';

  return (
    <ShadcnButton
      ref={ref}
      variant={shadcnVariant}
      size={shadcnSize}
      disabled={disabled || loading}
      className={cn(
        // Success variant styling (since shadcn doesn't have it)
        variant === 'success' && 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700',
        // XL size styling (since shadcn doesn't have it)
        size === 'xl' && 'h-12 px-8 text-base',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {leftIcon && !loading && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </ShadcnButton>
  );
});

Button.displayName = 'Button';

export default Button;