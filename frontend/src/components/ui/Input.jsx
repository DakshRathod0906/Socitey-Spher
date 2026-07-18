import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(
  ({ className, label, error, hint, icon: Icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="label block">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm",
              "placeholder:text-placeholder",
              "transition-colors duration-fast",
              "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus:ring-danger/20 focus:border-danger",
              Icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
