import React from 'react';
import { getCSSVariable } from '../../styles';

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
  style = {},
  href,
  onClick,
  ...props
}, ref) => {
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles = {
      textDecoration: underline === 'always' ? 'underline' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: getCSSVariable('--transition-base'),
      display: 'inline-flex',
      alignItems: 'center',
      gap: getCSSVariable('--spacing-xs')
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        color: getCSSVariable('--color-primary-500'),
        ':hover': !disabled ? {
          color: getCSSVariable('--color-primary-600'),
          textDecoration: underline === 'hover' ? 'underline' : undefined
        } : {},
        ':active': !disabled ? {
          color: getCSSVariable('--color-primary-700')
        } : {}
      },
      subtle: {
        color: getCSSVariable('--color-text'),
        ':hover': !disabled ? {
          color: getCSSVariable('--color-primary-500'),
          textDecoration: underline === 'hover' ? 'underline' : undefined
        } : {},
        ':active': !disabled ? {
          color: getCSSVariable('--color-primary-600')
        } : {}
      },
      primary: {
        color: getCSSVariable('--color-primary-500'),
        fontWeight: getCSSVariable('--font-weight-medium'),
        ':hover': !disabled ? {
          color: getCSSVariable('--color-primary-600'),
          textDecoration: underline === 'hover' ? 'underline' : undefined
        } : {},
        ':active': !disabled ? {
          color: getCSSVariable('--color-primary-700')
        } : {}
      },
      danger: {
        color: getCSSVariable('--color-error-500'),
        ':hover': !disabled ? {
          color: '#dc2626',
          textDecoration: underline === 'hover' ? 'underline' : undefined
        } : {},
        ':active': !disabled ? {
          color: '#b91c1c'
        } : {}
      },
      unstyled: {
        color: 'inherit',
        ':hover': !disabled && underline === 'hover' ? {
          textDecoration: 'underline'
        } : {}
      }
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  const linkStyles: React.CSSProperties = {
    fontSize: getCSSVariable(`--font-size-${size}`),
    fontWeight: getCSSVariable(`--font-weight-${weight}`),
    ...getVariantStyles(),
    ...style
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disabled) {
      const hoverStyles = getVariantStyles()[':hover' as keyof React.CSSProperties];
      if (hoverStyles) {
        Object.assign(e.currentTarget.style, hoverStyles);
      }
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disabled) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, getVariantStyles());
    }
    props.onMouseLeave?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disabled) {
      const activeStyles = getVariantStyles()[':active' as keyof React.CSSProperties];
      if (activeStyles) {
        Object.assign(e.currentTarget.style, activeStyles);
      }
    }
    props.onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disabled) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, getVariantStyles());
    }
    props.onMouseUp?.(e);
  };

  // Determine if link is external
  const isExternal = external || (href && (href.startsWith('http') || href.startsWith('mailto:')));

  // External link icon SVG
  const ExternalIcon = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      style={{ flexShrink: 0 }}
    >
      <path d="M6 1H11V6M11 1L1 11" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <a
      ref={ref}
      href={disabled ? undefined : href}
      style={linkStyles}
      className={`design-system-link design-system-link-${variant} ${className}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
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