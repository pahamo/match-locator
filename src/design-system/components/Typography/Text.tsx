import React from 'react';
import { getCSSVariable } from '../../styles';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Font size */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Font weight */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text color */
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Text variant for semantic meaning */
  variant?: 'body' | 'caption' | 'subtitle' | 'overline' | 'code';
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Number of lines before truncating (requires -webkit-line-clamp support) */
  lineClamp?: number;
  /** HTML element to render */
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'code' | 'pre';
  /** Enable text selection (defaults to true) */
  selectable?: boolean;
}

const Text = React.forwardRef<HTMLElement, TextProps>(({
  size = 'base',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  variant = 'body',
  truncate = false,
  lineClamp,
  as = 'p',
  selectable = true,
  children,
  className = '',
  style = {},
  ...props
}, ref) => {
  const getColorValue = () => {
    const colorMap = {
      primary: getCSSVariable('--color-text'),
      secondary: getCSSVariable('--color-heading'),
      muted: getCSSVariable('--color-muted'),
      success: getCSSVariable('--color-success-500'),
      warning: getCSSVariable('--color-warning-500'),
      error: getCSSVariable('--color-error-500'),
      inherit: 'inherit'
    };
    return colorMap[color];
  };

  const getVariantStyles = (): Partial<React.CSSProperties> => {
    const variants = {
      body: {
        lineHeight: '1.6'
      },
      caption: {
        fontSize: getCSSVariable('--font-size-sm'),
        lineHeight: '1.4',
        color: getCSSVariable('--color-muted')
      },
      subtitle: {
        fontSize: getCSSVariable('--font-size-lg'),
        fontWeight: getCSSVariable('--font-weight-medium'),
        lineHeight: '1.5'
      },
      overline: {
        fontSize: getCSSVariable('--font-size-xs'),
        fontWeight: getCSSVariable('--font-weight-semibold'),
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        lineHeight: '1.2'
      },
      code: {
        fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '0.9em',
        backgroundColor: getCSSVariable('--color-gray-100'),
        padding: '0.125rem 0.25rem',
        borderRadius: getCSSVariable('--border-radius-sm'),
        border: `1px solid ${getCSSVariable('--color-gray-200')}`
      }
    };
    return variants[variant] || variants.body;
  };

  const getTruncationStyles = (): Partial<React.CSSProperties> => {
    if (lineClamp && lineClamp > 0) {
      return {
        display: '-webkit-box',
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      };
    }

    if (truncate) {
      return {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      };
    }

    return {};
  };

  const textStyles: React.CSSProperties = {
    fontSize: variant !== 'caption' && variant !== 'subtitle' && variant !== 'overline'
      ? getCSSVariable(`--font-size-${size}`)
      : undefined,
    fontWeight: variant !== 'caption' && variant !== 'subtitle' && variant !== 'overline'
      ? getCSSVariable(`--font-weight-${weight}`)
      : undefined,
    color: variant !== 'caption' ? getColorValue() : undefined,
    textAlign: align,
    margin: as === 'p' ? '0 0 1rem 0' : 0, // Only add margin to paragraphs
    userSelect: selectable ? 'text' : 'none',
    ...getVariantStyles(),
    ...getTruncationStyles(),
    ...style
  };

  return React.createElement(
    as,
    {
      ref: ref as React.Ref<any>,
      style: textStyles,
      className: `design-system-text design-system-text-${variant} ${className}`,
      ...props
    },
    children
  );
});

Text.displayName = 'Text';

export default Text;