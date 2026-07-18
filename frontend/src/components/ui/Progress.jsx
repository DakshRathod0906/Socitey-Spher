import { cn } from "../../lib/utils";

const variantStyles = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export default function Progress({
  value = 0,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  className,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-muted">Progress</span>
          <span className="text-sm font-medium text-text">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary-light",
          size === "sm" && "h-1.5",
          size === "md" && "h-2",
          size === "lg" && "h-3"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-slow ease-out",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
