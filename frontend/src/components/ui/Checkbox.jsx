import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

const Checkbox = forwardRef(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                "h-4.5 w-4.5 h-[18px] w-[18px] rounded border border-border bg-surface",
                "transition-all duration-fast",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/20",
                "peer-checked:bg-primary peer-checked:border-primary",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                "group-hover:border-border-hover",
                error && "border-danger",
                className
              )}
            />
            <Check className="absolute top-0.5 left-0.5 h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          {label && <span className="text-sm text-text">{label}</span>}
        </label>
        {error && <p className="text-xs text-danger ml-6">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
