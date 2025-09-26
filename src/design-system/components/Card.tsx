import React from 'react';
import { cn } from '../../lib/utils';
import {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
} from '../../components/ui/card';

// Enhanced Card component with additional variants and features
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant for different contexts */
  variant?: 'default' | 'outline' | 'filled' | 'elevated' | 'live' | 'success' | 'warning' | 'error';
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Make card hoverable with hover effects */
  hoverable?: boolean;
  /** Make card clickable (adds cursor pointer) */
  clickable?: boolean;
  /** Loading state with skeleton effect */
  loading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'default',
  hoverable = false,
  clickable = false,
  loading = false,
  children,
  className,
  ...props
}) => {
  const cardClasses = cn(
    // Base card classes from shadcn
    'rounded-lg border bg-card text-card-foreground shadow-sm',

    // Size variants
    {
      'text-sm': size === 'sm',
      'text-base': size === 'default',
      'text-lg': size === 'lg',
    },

    // Variant colors and styling
    {
      'border-border bg-card': variant === 'default',
      'border-border bg-transparent': variant === 'outline',
      'border-muted bg-muted/50': variant === 'filled',
      'shadow-lg border-border': variant === 'elevated',
      'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 animate-pulse': variant === 'live',
      'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20': variant === 'success',
      'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20': variant === 'warning',
      'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20': variant === 'error',
    },

    // Interactive states
    {
      'transition-all duration-200 hover:shadow-md hover:scale-[1.02]': hoverable,
      'cursor-pointer': clickable,
      'hover:shadow-lg': clickable && !hoverable,
    },

    // Loading state
    loading && 'animate-pulse',

    className
  );

  if (loading) {
    return (
      <div className={cardClasses} {...props}>
        <div className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ShadcnCard className={cardClasses} {...props}>
      {children}
    </ShadcnCard>
  );
};

// Enhanced sub-components with size variations
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  size = 'default',
  className,
  ...props
}) => {
  const headerClasses = cn(
    'flex flex-col space-y-1.5',
    {
      'p-4': size === 'sm',
      'p-6': size === 'default',
      'p-8': size === 'lg',
    },
    className
  );

  return <ShadcnCardHeader className={headerClasses} {...props} />;
};

export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  size = 'default',
  as = 'h3',
  className,
  children,
  ...props
}) => {
  const titleClasses = cn(
    'font-semibold leading-none tracking-tight',
    {
      'text-lg': size === 'sm',
      'text-2xl': size === 'default',
      'text-3xl': size === 'lg',
    },
    className
  );

  const Component = as;

  return (
    <Component className={titleClasses} {...props}>
      {children}
    </Component>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <ShadcnCardDescription
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
};

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

export const CardContent: React.FC<CardContentProps> = ({
  size = 'default',
  className,
  ...props
}) => {
  const contentClasses = cn(
    'pt-0',
    {
      'p-4': size === 'sm',
      'p-6': size === 'default',
      'p-8': size === 'lg',
    },
    className
  );

  return <ShadcnCardContent className={contentClasses} {...props} />;
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  size = 'default',
  className,
  ...props
}) => {
  const footerClasses = cn(
    'flex items-center pt-0',
    {
      'p-4': size === 'sm',
      'p-6': size === 'default',
      'p-8': size === 'lg',
    },
    className
  );

  return <ShadcnCardFooter className={footerClasses} {...props} />;
};

// Re-export shadcn Card components for advanced usage
export {
  Card as ShadcnCard,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardContent as ShadcnCardContent,
  CardFooter as ShadcnCardFooter,
} from '../../components/ui/card';