import { cn } from "../../lib/utils";

const variantStyles = {
  default: "bg-secondary-light text-text-secondary",
  primary: "bg-primary-light text-primary",
  success: "bg-success-light text-success-foreground",
  warning: "bg-warning-light text-warning-foreground",
  danger: "bg-danger-light text-danger-foreground",
  info: "bg-info-light text-info-foreground",
  outline: "border border-border text-text-secondary bg-transparent",
};

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2.5 py-1",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "danger" && "bg-danger",
            variant === "info" && "bg-info",
            variant === "primary" && "bg-primary",
            (variant === "default" || variant === "outline") && "bg-muted"
          )}
        />
      )}
      {children}
    </span>
  );
}
