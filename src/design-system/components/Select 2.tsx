import React from 'react';
import { cn } from '../../lib/utils';
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';

// Enhanced Select component with label and helper text support
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options to display in the select */
  options: SelectOption[];
  /** Current selected value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error text */
  errorText?: string;
  /** Variant for styling */
  variant?: 'default' | 'error';
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Callback when value changes */
  onValueChange?: (value: string) => void;
  /** Additional class name */
  className?: string;
  /** HTML name attribute */
  name?: string;
}

export const Select = React.forwardRef<
  React.ElementRef<typeof ShadcnSelect>,
  SelectProps
>(({
  options,
  value,
  defaultValue,
  placeholder = 'Select an option...',
  label,
  helperText,
  errorText,
  variant = 'default',
  disabled = false,
  required = false,
  onValueChange,
  className,
  name,
  ...props
}, ref) => {
  const id = React.useId();
  const helperTextId = React.useId();
  const errorTextId = React.useId();

  const displayHelperText = variant === 'error' ? errorText : helperText;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            variant === 'error' && 'text-destructive',
            required && 'after:content-["*"] after:ml-0.5 after:text-destructive'
          )}
        >
          {label}
        </Label>
      )}

      <ShadcnSelect
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        {...props}
      >
        <SelectTrigger
          id={id}
          className={cn(
            variant === 'error' && 'border-destructive focus:ring-destructive'
          )}
          aria-describedby={displayHelperText ? (variant === 'error' ? errorTextId : helperTextId) : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>

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

Select.displayName = 'Select';

// Re-export shadcn Select components for advanced usage
export {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';