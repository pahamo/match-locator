import React from 'react';
import { cn } from '../../lib/utils';
import {
  Tabs as ShadcnTabs,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
  TabsContent as ShadcnTabsContent,
} from '../../components/ui/tabs';

// Enhanced Tabs component with additional variants and features
export interface TabsProps extends React.ComponentProps<typeof ShadcnTabs> {
  /** Variant for tabs styling */
  variant?: 'default' | 'pills' | 'underline' | 'card';
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}

export const Tabs: React.FC<TabsProps> = ({
  variant = 'default',
  size = 'default',
  orientation = 'horizontal',
  className,
  children,
  ...props
}) => {
  return (
    <ShadcnTabs
      orientation={orientation}
      className={cn(
        orientation === 'vertical' && 'flex gap-4',
        className
      )}
      {...props}
    >
      {children}
    </ShadcnTabs>
  );
};

export interface TabsListProps extends React.ComponentProps<typeof ShadcnTabsList> {
  /** Variant for tabs list styling */
  variant?: 'default' | 'pills' | 'underline' | 'card';
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
}

export const TabsList: React.FC<TabsListProps> = ({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}) => {
  const listClasses = cn(
    // Base classes
    'inline-flex items-center justify-center',

    // Variant styles
    {
      'rounded-md bg-muted p-1': variant === 'default',
      'bg-transparent p-0 gap-2': variant === 'pills',
      'bg-transparent p-0 border-b border-border': variant === 'underline',
      'bg-card border border-border rounded-lg p-1': variant === 'card',
    },

    // Size variants
    {
      'h-8 text-sm': size === 'sm',
      'h-10 text-base': size === 'default',
      'h-12 text-lg': size === 'lg',
    },

    className
  );

  return (
    <ShadcnTabsList className={listClasses} {...props}>
      {children}
    </ShadcnTabsList>
  );
};

export interface TabsTriggerProps extends React.ComponentProps<typeof ShadcnTabsTrigger> {
  /** Variant for trigger styling */
  variant?: 'default' | 'pills' | 'underline' | 'card';
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Badge count */
  badge?: number;
  /** Icon element */
  icon?: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  variant = 'default',
  size = 'default',
  badge,
  icon,
  className,
  children,
  ...props
}) => {
  const triggerClasses = cn(
    // Base classes
    'inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',

    // Variant styles
    {
      'rounded-sm px-3 py-1.5 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm':
        variant === 'default',

      'rounded-full px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground':
        variant === 'pills',

      'px-4 py-2 border-b-2 border-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground':
        variant === 'underline',

      'rounded-md px-3 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow':
        variant === 'card',
    },

    // Size variants
    {
      'text-xs px-2 py-1': size === 'sm',
      'text-sm px-3 py-1.5': size === 'default',
      'text-base px-4 py-2': size === 'lg',
    },

    className
  );

  return (
    <ShadcnTabsTrigger className={triggerClasses} {...props}>
      <div className="flex items-center gap-2">
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
        {badge !== undefined && badge > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium h-5 min-w-[20px] px-1">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
    </ShadcnTabsTrigger>
  );
};

export interface TabsContentProps extends React.ComponentProps<typeof ShadcnTabsContent> {
  /** Size variant for content padding */
  size?: 'sm' | 'default' | 'lg';
}

export const TabsContent: React.FC<TabsContentProps> = ({
  size = 'default',
  className,
  ...props
}) => {
  const contentClasses = cn(
    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',

    // Size-based padding
    {
      'p-2': size === 'sm',
      'p-4': size === 'default',
      'p-6': size === 'lg',
    },

    className
  );

  return <ShadcnTabsContent className={contentClasses} {...props} />;
};

// Re-export shadcn Tabs components for advanced usage
export {
  Tabs as ShadcnTabs,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
  TabsContent as ShadcnTabsContent,
} from '../../components/ui/tabs';