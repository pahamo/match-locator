import React from 'react';
import { cn } from '../../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Container size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Center the container */
  center?: boolean;
  /** Add horizontal padding */
  padding?: boolean;
  /** Custom padding size */
  paddingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(({
  size = 'xl',
  center = true,
  padding = true,
  paddingSize = 'lg',
  children,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'max-w-sm',      // ~384px
    md: 'max-w-md',      // ~448px
    lg: 'max-w-4xl',     // ~896px
    xl: 'max-w-6xl',     // ~1152px
    '2xl': 'max-w-7xl',  // ~1280px
    full: 'max-w-none'
  };

  const paddingClasses = {
    xs: 'px-1',    // 4px
    sm: 'px-2',    // 8px
    md: 'px-3',    // 12px
    lg: 'px-4',    // 16px
    xl: 'px-5',    // 20px
    '2xl': 'px-6'  // 24px
  };

  return (
    <div
      ref={ref}
      className={cn(
        'w-full',
        sizeClasses[size],
        center && 'mx-auto',
        padding && paddingClasses[paddingSize],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default Container;