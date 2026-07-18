import { cn } from "../../lib/utils";

export default function Card({ children, className, hover = false, padding = true, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs",
        padding && "p-5",
        hover && "transition-shadow duration-fast hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn("text-base font-semibold text-text", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn("text-sm text-muted mt-0.5", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn("flex items-center gap-2 mt-4 pt-4 border-t border-border", className)}>
      {children}
    </div>
  );
}
