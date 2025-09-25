import React from 'react';
import { getCSSVariable } from '../../styles';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Checkbox size */
  size?: 'sm' | 'md' | 'lg';
  /** Checkbox variant/state */
  variant?: 'default' | 'error' | 'success';
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error text (shows when variant is error) */
  errorText?: string;
  /** Success text (shows when variant is success) */
  successText?: string;
  /** Indeterminate state */
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({
  size = 'md',
  variant = 'default',
  label,
  helperText,
  errorText,
  successText,
  indeterminate = false,
  checked,
  disabled,
  className = '',
  style = {},
  ...props
}, ref) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  // Handle indeterminate state
  React.useEffect(() => {
    const checkbox = checkboxRef.current || (ref as React.MutableRefObject<HTMLInputElement>)?.current;
    if (checkbox) {
      checkbox.indeterminate = indeterminate;
    }
  }, [indeterminate, ref]);

  const getCheckboxStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      appearance: 'none',
      borderRadius: getCSSVariable('--border-radius-sm'),
      transition: getCSSVariable('--transition-base'),
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: (checked || indeterminate) ? getCSSVariable('--color-primary-500') : getCSSVariable('--color-card'),
      backgroundImage: checked
        ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l6.646-6.647a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")`
        : indeterminate
        ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e")`
        : 'none',
      backgroundSize: '16px 16px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      opacity: disabled ? 0.6 : 1
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        border: `1px solid ${(checked || indeterminate) ? getCSSVariable('--color-primary-500') : getCSSVariable('--color-border')}`
      },
      error: {
        border: `1px solid ${getCSSVariable('--color-error-500')}`,
        backgroundColor: (checked || indeterminate) ? getCSSVariable('--color-error-500') : getCSSVariable('--color-card')
      },
      success: {
        border: `1px solid ${getCSSVariable('--color-success-500')}`,
        backgroundColor: (checked || indeterminate) ? getCSSVariable('--color-success-500') : getCSSVariable('--color-card')
      }
    };

    return { ...baseStyles, ...variantStyles[variant] };
  };

  const getSizeStyles = (): React.CSSProperties => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        width: '16px',
        height: '16px'
      },
      md: {
        width: '20px',
        height: '20px'
      },
      lg: {
        width: '24px',
        height: '24px'
      }
    };

    return sizeStyles[size];
  };

  const checkboxStyles: React.CSSProperties = {
    ...getCheckboxStyles(),
    ...getSizeStyles(),
    ...style
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: getCSSVariable('--spacing-xs')
  };

  const labelContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: getCSSVariable('--spacing-sm'),
    cursor: disabled ? 'not-allowed' : 'pointer'
  };

  const labelStyles: React.CSSProperties = {
    fontSize: getCSSVariable('--font-size-sm'),
    fontWeight: getCSSVariable('--font-weight-normal'),
    color: disabled ? getCSSVariable('--color-muted') : getCSSVariable('--color-text'),
    lineHeight: '1.5',
    userSelect: 'none'
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: getCSSVariable('--font-size-xs'),
    color: variant === 'error' ? getCSSVariable('--color-error-500')
          : variant === 'success' ? getCSSVariable('--color-success-500')
          : getCSSVariable('--color-muted'),
    paddingLeft: `calc(${getSizeStyles().width} + ${getCSSVariable('--spacing-sm')})`
  };

  const getFocusStyles = (): React.CSSProperties => {
    const focusMap: Record<string, React.CSSProperties> = {
      default: {
        outline: `2px solid ${getCSSVariable('--color-primary-500')}`,
        outlineOffset: '2px'
      },
      error: {
        outline: `2px solid ${getCSSVariable('--color-error-500')}`,
        outlineOffset: '2px'
      },
      success: {
        outline: `2px solid ${getCSSVariable('--color-success-500')}`,
        outlineOffset: '2px'
      }
    };
    return focusMap[variant] || {};
  };

  const getHoverStyles = (): React.CSSProperties => {
    if (disabled) return {};
    return {
      borderColor: getCSSVariable('--color-primary-400')
    };
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.currentTarget.style, getFocusStyles());
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Reset to base styles
    Object.assign(e.currentTarget.style, checkboxStyles);
    props.onBlur?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!disabled) {
      Object.assign(e.currentTarget.style, getHoverStyles());
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLInputElement>) => {
    if (!disabled) {
      // Reset to base styles
      Object.assign(e.currentTarget.style, checkboxStyles);
    }
    props.onMouseLeave?.(e);
  };

  const getHelperText = () => {
    if (variant === 'error' && errorText) return errorText;
    if (variant === 'success' && successText) return successText;
    return helperText;
  };

  const finalRef = ref || checkboxRef;

  return (
    <div style={containerStyles} className={`design-system-checkbox-container ${className}`}>
      <label style={labelContainerStyles} className="design-system-checkbox-label">
        <input
          ref={finalRef as React.RefObject<HTMLInputElement>}
          type="checkbox"
          style={checkboxStyles}
          className={`design-system-checkbox ${className}`}
          checked={checked}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        />
        {label && (
          <span style={labelStyles}>
            {label}
          </span>
        )}
      </label>
      {getHelperText() && (
        <span style={helperTextStyles} className="design-system-checkbox-helper">
          {getHelperText()}
        </span>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;