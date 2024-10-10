import * as React from "react";
import { cn } from "@/lib/utils"; // Ensure you have this utility for className merging
import { cva, type VariantProps } from "class-variance-authority";

// Define the text area variants for styling
const textareaVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-20",
        sm: "h-16",
        lg: "h-24",
      },
      variant: {
        default: "border-input bg-background",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

// Define the props for Textarea, using both the standard input props and the variant props
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

// Create the Textarea component with a forward ref for better flexibility
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(textareaVariants({ size, variant, className }))}
        {...props}
      />
    );
  }
);

// Display name for the Textarea component for better debugging
Textarea.displayName = "Textarea";

// Export the component
export { Textarea };
