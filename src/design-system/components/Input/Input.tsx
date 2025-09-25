import React from 'react';
import { getCSSVariable } from '../../styles';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Input variant/state */
  variant?: 'default' | 'error' | 'success';
  /** Full width input */
  fullWidth?: boolean;
  /** Left icon */
  leftIcon?: React.ReactNode;
  /** Right icon */
  rightIcon?: React.ReactNode;
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error text (shows when variant is error) */
  errorText?: string;
  /** Success text (shows when variant is success) */
  successText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  size = 'md',
  variant = 'default',
  fullWidth = false,
  leftIcon,
  rightIcon,
  label,
  helperText,
  errorText,
  successText,
  disabled,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getInputStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      fontFamily: 'inherit',
      fontSize: getCSSVariable('--font-size-sm'),
      lineHeight: '1.5',
      borderRadius: getCSSVariable('--border-radius-md'),
      transition: getCSSVariable('--transition-base'),
      outline: 'none',
      width: fullWidth ? '100%' : undefined,
      backgroundColor: disabled ? getCSSVariable('--color-gray-50') : getCSSVariable('--color-card'),
      color: getCSSVariable('--color-text'),
      opacity: disabled ? 0.6 : 1
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        border: `1px solid ${getCSSVariable('--color-border')}`,
        ':focus': {
          borderColor: getCSSVariable('--color-primary-500'),
          boxShadow: `0 0 0 3px ${getCSSVariable('--color-primary-100')}`
        },
        ':hover': !disabled ? {
          borderColor: getCSSVariable('--color-gray-300')
        } : {}
      },
      error: {
        border: `1px solid ${getCSSVariable('--color-error-500')}`,
        ':focus': {
          borderColor: getCSSVariable('--color-error-500'),
          boxShadow: `0 0 0 3px ${getCSSVariable('--color-error-50')}`
        }
      },
      success: {
        border: `1px solid ${getCSSVariable('--color-success-500')}`,
        ':focus': {
          borderColor: getCSSVariable('--color-success-500'),
          boxShadow: `0 0 0 3px ${getCSSVariable('--color-success-50')}`
        }
      }
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  const getSizeStyles = (): React.CSSProperties => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: leftIcon || rightIcon
          ? `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-2xl')} ${getCSSVariable('--spacing-xs')} ${leftIcon ? getCSSVariable('--spacing-2xl') : getCSSVariable('--spacing-md')}`
          : `${getCSSVariable('--spacing-xs')} ${getCSSVariable('--spacing-md')}`,
        fontSize: getCSSVariable('--font-size-sm'),
        minHeight: '32px'
      },
      md: {
        padding: leftIcon || rightIcon
          ? `${getCSSVariable('--spacing-sm')} ${getCSSVariable('--spacing-2xl')} ${getCSSVariable('--spacing-sm')} ${leftIcon ? getCSSVariable('--spacing-2xl') : getCSSVariable('--spacing-lg')}`
          : `${getCSSVariable('--spacing-sm')} ${getCSSVariable('--spacing-lg')}`,
        fontSize: getCSSVariable('--font-size-sm'),
        minHeight: '40px'
      },
      lg: {
        padding: leftIcon || rightIcon
          ? `${getCSSVariable('--spacing-md')} ${getCSSVariable('--spacing-3xl')} ${getCSSVariable('--spacing-md')} ${leftIcon ? getCSSVariable('--spacing-3xl') : getCSSVariable('--spacing-xl')}`
          : `${getCSSVariable('--spacing-md')} ${getCSSVariable('--spacing-xl')}`,
        fontSize: getCSSVariable('--font-size-base'),
        minHeight: '48px'
      }
    };

    return sizeStyles[size];
  };

  const inputStyles: React.CSSProperties = {
    ...getInputStyles(),
    ...getSizeStyles(),
    ...style
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    width: fullWidth ? '100%' : undefined
  };

  const labelStyles: React.CSSProperties = {
    fontSize: getCSSVariable('--font-size-sm'),
    fontWeight: getCSSVariable('--font-weight-medium'),
    color: getCSSVariable('--color-heading'),
    marginBottom: getCSSVariable('--spacing-xs'),
    display: 'block'
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: getCSSVariable('--color-muted'),
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: size === 'sm' ? getCSSVariable('--spacing-sm') : getCSSVariable('--spacing-md')
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: size === 'sm' ? getCSSVariable('--spacing-sm') : getCSSVariable('--spacing-md')
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: getCSSVariable('--font-size-xs'),
    marginTop: getCSSVariable('--spacing-xs'),
    color: variant === 'error' ? getCSSVariable('--color-error-500')
          : variant === 'success' ? getCSSVariable('--color-success-500')
          : getCSSVariable('--color-muted')
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const focusStyles = getInputStyles()[':focus' as keyof React.CSSProperties];
    if (focusStyles) {
      Object.assign(e.currentTarget.style, focusStyles);
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Reset to base styles
    Object.assign(e.currentTarget.style, getInputStyles());
    props.onBlur?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!disabled) {
      const hoverStyles = getInputStyles()[':hover' as keyof React.CSSProperties];
      if (hoverStyles) {
        Object.assign(e.currentTarget.style, hoverStyles);
      }
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!disabled) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, getInputStyles());
    }
    props.onMouseLeave?.(e);
  };

  const getHelperText = () => {
    if (variant === 'error' && errorText) return errorText;
    if (variant === 'success' && successText) return successText;
    return helperText;
  };

  return (
    <div style={containerStyles} className={`design-system-input-container ${className}`}>
      {label && (
        <label style={labelStyles} className="design-system-input-label">
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex' }}>
        {leftIcon && (
          <div style={leftIconStyles} className="design-system-input-left-icon">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          style={inputStyles}
          className={`design-system-input ${className}`}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        />
        {rightIcon && (
          <div style={rightIconStyles} className="design-system-input-right-icon">
            {rightIcon}
          </div>
        )}
      </div>
      {getHelperText() && (
        <span style={helperTextStyles} className="design-system-input-helper">
          {getHelperText()}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;