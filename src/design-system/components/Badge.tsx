import React from 'react';
import { cn } from '../../lib/utils';
import { Badge as ShadcnBadge } from '../../components/ui/badge';
import type { BadgeProps as ShadcnBadgeProps } from '../../components/ui/badge';

// Enhanced Badge component with additional variants for our use cases
export interface BadgeProps extends Omit<ShadcnBadgeProps, 'variant'> {
  /** Badge variant for different contexts */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'live' | 'epl' | 'ucl';
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Dot indicator for status badges */
  dot?: boolean;
  /** Make badge removable with X button */
  removable?: boolean;
  /** Callback when badge is removed */
  onRemove?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({
  variant = 'default',
  size = 'default',
  dot = false,
  removable = false,
  onRemove,
  children,
  className,
  ...props
}, ref) => {
  // Map our custom variants to shadcn or handle with custom classes
  const getShadcnVariant = (): ShadcnBadgeProps['variant'] => {
    switch (variant) {
      case 'success':
      case 'warning':
      case 'live':
      case 'epl':
      case 'ucl':
        return 'default'; // We'll override with custom classes
      default:
        return variant;
    }
  };

  const customVariantClasses = cn(
    // Size variants
    {
      'px-1.5 py-0.5 text-xs': size === 'sm',
      'px-2.5 py-0.5 text-xs': size === 'default',
      'px-3 py-1 text-sm': size === 'lg',
    },

    // Custom variant colors
    {
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800': variant === 'success',
      'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800': variant === 'warning',
      'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 animate-pulse': variant === 'live',
      'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800': variant === 'epl',
      'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800': variant === 'ucl',
    },

    // Dot indicator
    dot && 'pl-6 relative',

    className
  );

  return (
    <ShadcnBadge
      ref={ref}
      variant={getShadcnVariant()}
      className={customVariantClasses}
      {...props}
    >
      {dot && (
        <span className={cn(
          'absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full',
          {
            'bg-green-500': variant === 'success',
            'bg-yellow-500': variant === 'warning',
            'bg-red-500': variant === 'live' || variant === 'destructive',
            'bg-purple-500': variant === 'epl',
            'bg-blue-500': variant === 'ucl',
            'bg-primary': variant === 'default',
            'bg-muted-foreground': variant === 'secondary' || variant === 'outline',
          }
        )} />
      )}

      {children}

      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          type="button"
          aria-label="Remove badge"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </ShadcnBadge>
  );
});

Badge.displayName = 'Badge';

export default Badge;