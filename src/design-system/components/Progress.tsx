import React from 'react';
import { cn } from '../../lib/utils';
import { Progress as ShadcnProgress } from '../../components/ui/progress';

// Enhanced Progress component with additional variants and features
export interface ProgressProps {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show value text */
  showValue?: boolean;
  /** Custom label */
  label?: string;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Striped pattern */
  striped?: boolean;
  /** Animated stripes */
  animated?: boolean;
  /** Additional class name */
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  max = 100,
  size = 'default',
  variant = 'default',
  showPercentage = false,
  showValue = false,
  label,
  indeterminate = false,
  striped = false,
  animated = false,
  className,
}) => {
  const percentage = Math.round((value / max) * 100);
  const displayValue = indeterminate ? undefined : value;

  const progressClasses = cn(
    {
      'h-2': size === 'sm',
      'h-4': size === 'default',
      'h-6': size === 'lg',
    },
    className
  );

  const indicatorClasses = cn(
    'h-full w-full flex-1 transition-all',
    {
      // Color variants
      'bg-primary': variant === 'default',
      'bg-green-500': variant === 'success',
      'bg-yellow-500': variant === 'warning',
      'bg-red-500': variant === 'error',
      'bg-blue-500': variant === 'info',
    },
    {
      // Indeterminate animation
      'animate-pulse': indeterminate && !animated,
    },
    striped && 'bg-gradient-to-r from-current to-transparent bg-[length:1rem_1rem]',
    animated && 'animate-pulse'
  );

  return (
    <div className="w-full space-y-2">
      {/* Label and value display */}
      {(label || showPercentage || showValue) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          <div className="flex gap-2">
            {showValue && !indeterminate && (
              <span className="font-medium">
                {value}/{max}
              </span>
            )}
            {showPercentage && !indeterminate && (
              <span className="font-medium">{percentage}%</span>
            )}
            {indeterminate && (
              <span className="text-muted-foreground">Loading...</span>
            )}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <ShadcnProgress
        value={displayValue}
        max={max}
        className={progressClasses}
        style={{
          '--progress-indicator-classes': indicatorClasses,
        } as React.CSSProperties}
      />
    </div>
  );
};

// Circular Progress component
export interface CircularProgressProps {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value (default 100) */
  max?: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Show percentage in center */
  showPercentage?: boolean;
  /** Show value in center */
  showValue?: boolean;
  /** Custom center content */
  children?: React.ReactNode;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Additional class name */
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showPercentage = false,
  showValue = false,
  children,
  indeterminate = false,
  className,
}) => {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = indeterminate ? circumference : circumference;
  const strokeDashoffset = indeterminate ? circumference * 0.75 : circumference - (percentage / 100) * circumference;

  const colors = {
    default: 'stroke-primary',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    error: 'stroke-red-500',
    info: 'stroke-blue-500',
  };

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            colors[variant],
            'transition-all duration-300 ease-in-out',
            indeterminate && 'animate-spin'
          )}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <div className="text-center">
            {showPercentage && !indeterminate && (
              <div className="text-sm font-semibold">{Math.round(percentage)}%</div>
            )}
            {showValue && !indeterminate && (
              <div className="text-xs text-muted-foreground">
                {value}/{max}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Re-export shadcn Progress for advanced usage
export { Progress as ShadcnProgress } from '../../components/ui/progress';