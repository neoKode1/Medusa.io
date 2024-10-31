import * as React from 'react';
import { cn } from '@/lib/utils'; // Utility function for merging class names
import { cva, type VariantProps } from 'class-variance-authority';

// Define input variants using cva for class variations
const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      inputSize: {
        // Renaming 'size' to 'inputSize' to avoid conflicts with HTML input attributes
        default: 'h-10',
        sm: 'h-9',
        lg: 'h-11',
      },
      variant: {
        default: 'border-input bg-background',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      inputSize: 'default', // Use 'inputSize' in default variants
      variant: 'default',
    },
  }
);

// Define the props interface extending HTML input props and variant props
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  inputSize?: 'default' | 'sm' | 'lg'; // Use 'inputSize' instead of 'size'
}

// Forward ref for input component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = 'default', variant = 'default', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputVariants({ inputSize, variant, className }))} // Use 'inputSize' in inputVariants
        {...props}
      />
    );
  }
);

// Define display name for the Input component
Input.displayName = 'Input';

export { Input };
