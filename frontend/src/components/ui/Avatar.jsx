import { cn } from "../../lib/utils";
import { User } from "lucide-react";

const sizeStyles = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusColors = {
  online: "bg-success",
  offline: "bg-muted",
  busy: "bg-danger",
  away: "bg-warning",
};

export default function Avatar({
  src,
  alt = "",
  name,
  size = "md",
  status,
  className,
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "rounded-full bg-primary-light text-primary font-medium",
          "flex items-center justify-center overflow-hidden",
          sizeStyles[size]
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="h-full w-full object-cover"
          />
        ) : initials ? (
          initials
        ) : (
          <User className="h-1/2 w-1/2" />
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-surface",
            statusColors[status],
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
          )}
        />
      )}
    </div>
  );
}
