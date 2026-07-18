import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Radio = forwardRef(
  ({ className, label, error, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-[18px] w-[18px] rounded-full border border-border bg-surface",
              "transition-all duration-fast",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/20",
              "peer-checked:border-primary",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "group-hover:border-border-hover",
              error && "border-danger",
              className
            )}
          />
          <div className="absolute top-[5px] left-[5px] h-2 w-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        {label && <span className="text-sm text-text">{label}</span>}
      </label>
    );
  }
);

Radio.displayName = "Radio";
export default Radio;
