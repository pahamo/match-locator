import React from 'react';
import { cn } from '../../../lib/utils';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Link variant */
  variant?: 'default' | 'subtle' | 'primary' | 'danger' | 'unstyled';
  /** Font size */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Underline style */
  underline?: 'always' | 'hover' | 'none';
  /** External link (adds icon and security attributes) */
  external?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Show external link icon */
  showExternalIcon?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({
  variant = 'default',
  size = 'base',
  weight = 'normal',
  underline = 'hover',
  external = false,
  disabled = false,
  showExternalIcon = true,
  children,
  className = '',
  href,
  onClick,
  ...props
}, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const classes = cn(
    // Base styles
    'inline-flex items-center gap-1 transition-colors cursor-pointer',

    // Disabled state
    disabled && 'cursor-not-allowed opacity-60 pointer-events-none',

    // Font sizes
    {
      'text-xs': size === 'xs',
      'text-sm': size === 'sm',
      'text-base': size === 'base',
      'text-lg': size === 'lg',
      'text-xl': size === 'xl',
    },

    // Font weights
    {
      'font-normal': weight === 'normal',
      'font-medium': weight === 'medium',
      'font-semibold': weight === 'semibold',
      'font-bold': weight === 'bold',
    },

    // Underline styles
    {
      'underline': underline === 'always',
      'hover:underline': underline === 'hover',
      'no-underline': underline === 'none',
    },

    // Variant colors with proper dark mode support
    {
      // Default: primary blue, darker on hover/dark mode
      'text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300': variant === 'default',

      // Subtle: text color, primary on hover
      'text-foreground hover:text-primary dark:hover:text-primary-400': variant === 'subtle',

      // Primary: bold primary, medium weight
      'text-primary hover:text-primary/80 dark:text-primary-400 dark:hover:text-primary-300 font-medium': variant === 'primary',

      // Danger: red with proper dark mode colors
      'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300': variant === 'danger',

      // Unstyled: inherit colors
      'text-inherit': variant === 'unstyled',
    },

    className
  );

  // Determine if link is external
  const isExternal = external || (href && (href.startsWith('http') || href.startsWith('mailto:')));

  // External link icon SVG
  const ExternalIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      className="flex-shrink-0"
    >
      <path d="M6 1H11V6M11 1L1 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <a
      ref={ref}
      href={disabled ? undefined : href}
      className={classes}
      onClick={handleClick}
      // Add security attributes for external links
      {...(isExternal && !disabled ? {
        target: '_blank',
        rel: 'noopener noreferrer'
      } : {})}
      // Add aria-disabled for screen readers
      {...(disabled ? { 'aria-disabled': true } : {})}
      {...props}
    >
      {children}
      {isExternal && showExternalIcon && !disabled && <ExternalIcon />}
    </a>
  );
});

Link.displayName = 'Link';

export default Link;