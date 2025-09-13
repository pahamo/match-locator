import React from 'react';
import { tokens } from '../tokens';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'live' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  size = 'md',
  className = '',
  style = {}
}) => {
  const variantStyles = {
    success: {
      background: tokens.colors.success[50],
      color: tokens.colors.success[500],
      border: `1px solid ${tokens.colors.success[500]}`
    },
    warning: {
      background: tokens.colors.warning[50],
      color: tokens.colors.warning[500],
      border: `1px solid ${tokens.colors.warning[500]}`
    },
    error: {
      background: tokens.colors.error[50],
      color: tokens.colors.error[500],
      border: `1px solid ${tokens.colors.error[500]}`
    },
    neutral: {
      background: tokens.colors.gray[100],
      color: tokens.colors.gray[500],
      border: `1px solid ${tokens.colors.gray[300]}`
    },
    live: {
      background: tokens.colors.live.background,
      color: tokens.colors.live.primary,
      border: `1px solid ${tokens.colors.live.border}`
    },
    primary: {
      background: tokens.colors.primary[50],
      color: tokens.colors.primary[600],
      border: `1px solid ${tokens.colors.primary[500]}`
    }
  };
  
  const sizeStyles = {
    sm: {
      fontSize: tokens.fontSize.xs,
      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`
    },
    md: {
      fontSize: tokens.fontSize.sm,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`
    },
    lg: {
      fontSize: tokens.fontSize.base,
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`
    }
  };
  
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadius.full,
    fontWeight: tokens.fontWeight.medium,
    whiteSpace: 'nowrap' as const,
    transition: tokens.transition.base,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style
  };
  
  return (
    <span 
      className={`badge badge--${variant} badge--${size} ${className}`}
      style={baseStyle}
    >
      {children}
    </span>
  );
};

export default Badge;