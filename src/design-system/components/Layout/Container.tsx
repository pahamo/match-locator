import React from 'react';
import { getCSSVariable } from '../../styles';
import { tokens } from '../../tokens';

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
  style = {},
  ...props
}, ref) => {
  const getMaxWidth = () => {
    if (size === 'full') return '100%';
    return getCSSVariable(`--container-${size}`);
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: getMaxWidth(),
    margin: center ? '0 auto' : undefined,
    paddingLeft: padding ? getCSSVariable(`--spacing-${paddingSize}`) : undefined,
    paddingRight: padding ? getCSSVariable(`--spacing-${paddingSize}`) : undefined,
    ...style
  };

  return (
    <div
      ref={ref}
      style={containerStyles}
      className={`design-system-container ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default Container;