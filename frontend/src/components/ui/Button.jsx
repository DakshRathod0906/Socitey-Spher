import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs",
  secondary:
    "bg-secondary-light text-text hover:bg-border",
  danger:
    "bg-danger text-white hover:bg-red-600",
  success:
    "bg-success text-white hover:bg-green-600",
  warning:
    "bg-warning text-white hover:bg-amber-600",
  outline:
    "border border-border bg-transparent text-text hover:bg-secondary-light",
  ghost:
    "bg-transparent text-text hover:bg-secondary-light",
  link:
    "bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-6 text-base gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-fast",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
