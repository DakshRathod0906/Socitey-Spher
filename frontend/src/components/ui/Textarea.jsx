import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Textarea = forwardRef(
  ({ className, label, error, hint, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="label block">{label}</label>}
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm",
            "placeholder:text-placeholder resize-y",
            "transition-colors duration-fast",
            "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:ring-danger/20 focus:border-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
