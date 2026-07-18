import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  ({ className, label, error, hint, options = [], placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="label block">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "flex h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3 py-2 pr-10 text-sm",
              "transition-colors duration-fast",
              "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-danger focus:ring-danger/20 focus:border-danger",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
