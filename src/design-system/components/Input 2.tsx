import React from 'react';
import { Input as ShadcnInput } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

// Enhanced Input component with label and helper text support
interface EnhancedInputProps extends React.ComponentProps<"input"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  variant?: 'default' | 'error';
}

const Input = React.forwardRef<HTMLInputElement, EnhancedInputProps>(({
  label,
  helperText,
  errorText,
  variant = 'default',
  className,
  ...props
}, ref) => {
  const id = React.useId();
  const helperTextId = React.useId();
  const errorTextId = React.useId();

  const displayHelperText = variant === 'error' ? errorText : helperText;

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={cn(variant === 'error' && 'text-destructive')}>
          {label}
        </Label>
      )}
      <ShadcnInput
        ref={ref}
        id={id}
        className={cn(
          variant === 'error' && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-describedby={displayHelperText ? (variant === 'error' ? errorTextId : helperTextId) : undefined}
        {...props}
      />
      {displayHelperText && (
        <p
          id={variant === 'error' ? errorTextId : helperTextId}
          className={cn(
            'text-sm',
            variant === 'error' ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          {displayHelperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Export the Input component
export { Input };

// Re-export Label for convenience
export { Label } from '../../components/ui/label';

// Re-export Checkbox for form components
export { Checkbox } from '../../components/ui/checkbox';