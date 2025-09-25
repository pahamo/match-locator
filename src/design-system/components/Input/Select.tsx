import React from 'react';
import { getCSSVariable } from '../../styles';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select size */
  size?: 'sm' | 'md' | 'lg';
  /** Select variant/state */
  variant?: 'default' | 'error' | 'success';
  /** Full width select */
  fullWidth?: boolean;
  /** Select options */
  options: SelectOption[];
  /** Select label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error text (shows when variant is error) */
  errorText?: string;
  /** Success text (shows when variant is success) */
  successText?: string;
  /** Placeholder option */
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  size = 'md',
  variant = 'default',
  fullWidth = false,
  options,
  label,
  helperText,
  errorText,
  successText,
  placeholder,
  disabled,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getSelectStyles = (): React.CSSProperties => {
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
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
      backgroundPosition: 'right 8px center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '16px 16px',
      paddingRight: getCSSVariable('--spacing-2xl')
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

    return sizeStyles[size];
  };

  const selectStyles: React.CSSProperties = {
    ...getSelectStyles(),
    ...getSizeStyles(),
    ...style
  };

  const containerStyles: React.CSSProperties = {
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

  const helperTextStyles: React.CSSProperties = {
    fontSize: getCSSVariable('--font-size-xs'),
    marginTop: getCSSVariable('--spacing-xs'),
    color: variant === 'error' ? getCSSVariable('--color-error-500')
          : variant === 'success' ? getCSSVariable('--color-success-500')
          : getCSSVariable('--color-muted')
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    const focusStyles = getSelectStyles()[':focus' as keyof React.CSSProperties];
    if (focusStyles) {
      Object.assign(e.currentTarget.style, focusStyles);
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    // Reset to base styles
    Object.assign(e.currentTarget.style, getSelectStyles());
    props.onBlur?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSelectElement>) => {
    if (!disabled) {
      const hoverStyles = getSelectStyles()[':hover' as keyof React.CSSProperties];
      if (hoverStyles) {
        Object.assign(e.currentTarget.style, hoverStyles);
      }
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLSelectElement>) => {
    if (!disabled) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, getSelectStyles());
    }
    props.onMouseLeave?.(e);
  };

  const getHelperText = () => {
    if (variant === 'error' && errorText) return errorText;
    if (variant === 'success' && successText) return successText;
    return helperText;
  };

  return (
    <div style={containerStyles} className={`design-system-select-container ${className}`}>
      {label && (
        <label style={labelStyles} className="design-system-select-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        style={selectStyles}
        className={`design-system-select ${className}`}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {getHelperText() && (
        <span style={helperTextStyles} className="design-system-select-helper">
          {getHelperText()}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;