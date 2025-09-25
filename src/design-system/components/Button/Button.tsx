import React from 'react';
import { getCSSVariable } from '../../styles';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Make button circular (for icon-only buttons) */
  rounded?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  rounded = false,
  children,
  disabled,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getVariantStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      border: 'none',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontWeight: getCSSVariable('--font-weight-medium'),
      borderRadius: rounded ? getCSSVariable('--border-radius-full') : getCSSVariable('--border-radius-md'),
      transition: getCSSVariable('--transition-base'),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: getCSSVariable('--spacing-sm'),
      textDecoration: 'none',
      opacity: disabled || loading ? 0.6 : 1,
      position: 'relative',
      width: fullWidth ? '100%' : 'auto'
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: getCSSVariable('--color-primary-500'),
        color: 'white',
        ':hover': !disabled && !loading ? {
          backgroundColor: getCSSVariable('--color-primary-600')
        } : {},
        ':active': !disabled && !loading ? {
          backgroundColor: getCSSVariable('--color-primary-700')
        } : {}
      },
      secondary: {
        backgroundColor: 'transparent',
        color: getCSSVariable('--color-primary-500'),
        border: `1px solid ${getCSSVariable('--color-primary-500')}`,
        ':hover': !disabled && !loading ? {
          backgroundColor: getCSSVariable('--color-primary-50'),
          borderColor: getCSSVariable('--color-primary-600'),
          color: getCSSVariable('--color-primary-600')
        } : {},
        ':active': !disabled && !loading ? {
          backgroundColor: getCSSVariable('--color-primary-100')
        } : {}
      },
      ghost: {
        backgroundColor: 'transparent',
        color: getCSSVariable('--color-gray-700'),
        border: 'none',
        ':hover': !disabled && !loading ? {
          backgroundColor: getCSSVariable('--color-gray-100'),
          color: getCSSVariable('--color-gray-900')
        } : {},
        ':active': !disabled && !loading ? {
          backgroundColor: getCSSVariable('--color-gray-200')
        } : {}
      },
      danger: {
        backgroundColor: getCSSVariable('--color-error-500'),
        color: 'white',
        ':hover': !disabled && !loading ? {
          backgroundColor: '#dc2626' // Slightly darker red
        } : {},
        ':active': !disabled && !loading ? {
          backgroundColor: '#b91c1c' // Even darker red
        } : {}
      },
      success: {
        backgroundColor: getCSSVariable('--color-success-500'),
        color: 'white',
        ':hover': !disabled && !loading ? {
          backgroundColor: '#15803d' // Slightly darker green
        } : {},
        ':active': !disabled && !loading ? {
          backgroundColor: '#166534' // Even darker green
        } : {}
      }
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  const getSizeStyles = (): React.CSSProperties => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: rounded ? getCSSVariable('--spacing-sm') : `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-md')}`,
        fontSize: getCSSVariable('--font-size-sm'),
        minHeight: '32px',
        minWidth: rounded ? '32px' : undefined
      },
      md: {
        padding: rounded ? getCSSVariable('--spacing-md') : `${getCSSVariable('--spacing-sm')} ${getCSSVariable('--spacing-lg')}`,
        fontSize: getCSSVariable('--font-size-sm'),
        minHeight: '40px',
        minWidth: rounded ? '40px' : undefined
      },
      lg: {
        padding: rounded ? getCSSVariable('--spacing-lg') : `${getCSSVariable('--spacing-md')} ${getCSSVariable('--spacing-xl')}`,
        fontSize: getCSSVariable('--font-size-base'),
        minHeight: '48px',
        minWidth: rounded ? '48px' : undefined
      },
      xl: {
        padding: rounded ? getCSSVariable('--spacing-xl') : `${getCSSVariable('--spacing-lg')} ${getCSSVariable('--spacing-2xl')}`,
        fontSize: getCSSVariable('--font-size-lg'),
        minHeight: '56px',
        minWidth: rounded ? '56px' : undefined
      }
    };

    return sizeStyles[size];
  };

  const buttonStyles: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const hoverStyles = getVariantStyles()[':hover' as keyof React.CSSProperties];
      if (hoverStyles) {
        Object.assign(e.currentTarget.style, hoverStyles);
      }
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, getVariantStyles());
    }
    props.onMouseLeave?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const activeStyles = getVariantStyles()[':active' as keyof React.CSSProperties];
      if (activeStyles) {
        Object.assign(e.currentTarget.style, activeStyles);
      }
    }
    props.onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, getVariantStyles());
    }
    props.onMouseUp?.(e);
  };

  const renderSpinner = () => (
    <div
      style={{
        width: size === 'sm' ? '12px' : '16px',
        height: size === 'sm' ? '12px' : '16px',
        border: `2px solid transparent`,
        borderTop: '2px solid currentColor',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );

  return (
    <button
      ref={ref}
      style={buttonStyles}
      className={`design-system-button ${className}`}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {loading && renderSpinner()}
      {!loading && leftIcon && leftIcon}
      {!rounded && children && (
        <span style={{ whiteSpace: 'nowrap' }}>
          {children}
        </span>
      )}
      {!loading && !rounded && rightIcon && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;