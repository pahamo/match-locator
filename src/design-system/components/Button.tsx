import React from 'react';
import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps, buttonVariants } from '../../components/ui/button';

// Custom Button wrapper that maps our old variant and size names to shadcn equivalents
interface CustomButtonProps extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'link' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'default';
}

export const Button = React.forwardRef<HTMLButtonElement, CustomButtonProps>(({
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  // Map our old variants to shadcn variants
  const variantMap: Record<string, ShadcnButtonProps['variant']> = {
    primary: 'default',
    secondary: 'secondary',
    ghost: 'ghost',
    danger: 'destructive',
    success: 'default', // shadcn doesn't have success, use default
    outline: 'outline',
    link: 'link',
    default: 'default'
  };

  // Map our old sizes to shadcn sizes
  const sizeMap: Record<string, ShadcnButtonProps['size']> = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
    xl: 'lg', // shadcn doesn't have xl, use lg
    icon: 'icon',
    default: 'default'
  };

  return (
    <ShadcnButton
      ref={ref}
      variant={variantMap[variant]}
      size={sizeMap[size]}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export type ButtonProps = CustomButtonProps;
export { buttonVariants };