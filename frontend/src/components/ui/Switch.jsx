import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Switch = forwardRef(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-5 w-9 rounded-full bg-border transition-colors duration-fast",
              "peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/20 peer-focus-visible:ring-offset-2",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              className
            )}
          />
          <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-fast peer-checked:translate-x-4" />
        </div>
        {label && <span className="text-sm text-text">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
export default Switch;
