import React from 'react';
import { getCSSVariable } from '../styles';

export interface SimpleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const SimpleButton = React.forwardRef<HTMLButtonElement, SimpleButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getVariantStyles = (): React.CSSProperties => {
    const variants: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: getCSSVariable('--color-primary-500'),
        color: 'white',
        border: 'none'
      },
      secondary: {
        backgroundColor: 'transparent',
        color: getCSSVariable('--color-primary-500'),
        border: `1px solid ${getCSSVariable('--color-primary-500')}`
      },
      ghost: {
        backgroundColor: 'transparent',
        color: getCSSVariable('--color-gray-700'),
        border: 'none'
      },
      danger: {
        backgroundColor: getCSSVariable('--color-error-500'),
        color: 'white',
        border: 'none'
      },
      success: {
        backgroundColor: getCSSVariable('--color-success-500'),
        color: 'white',
        border: 'none'
      }
    };
    return variants[variant];
  };

  const getSizeStyles = (): React.CSSProperties => {
    const sizes: Record<string, React.CSSProperties> = {
      sm: {
        padding: `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-md')}`,
        fontSize: getCSSVariable('--font-size-sm'),
        minHeight: '32px'
      },
      md: {
        padding: `${getCSSVariable('--spacing-sm')} ${getCSSVariable('--spacing-lg')}`,
        fontSize: getCSSVariable('--font-size-sm'),
        minHeight: '40px'
      },
      lg: {
        padding: `${getCSSVariable('--spacing-md')} ${getCSSVariable('--spacing-xl')}`,
        fontSize: getCSSVariable('--font-size-base'),
        minHeight: '48px'
      }
    };
    return sizes[size];
  };

  const buttonStyles: React.CSSProperties = {
    fontFamily: 'inherit',
    fontWeight: getCSSVariable('--font-weight-medium'),
    borderRadius: getCSSVariable('--border-radius-md'),
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: getCSSVariable('--transition-base'),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : 'auto',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button
      ref={ref}
      style={buttonStyles}
      className={`simple-button ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? '...' : children}
    </button>
  );
});

SimpleButton.displayName = 'SimpleButton';

export default SimpleButton;