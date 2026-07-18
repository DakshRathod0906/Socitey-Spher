import { cn } from "../../lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "../ui/Button";

export default function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  fullScreen = false,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        fullScreen && "fixed inset-0 z-overlay bg-background",
        className
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-danger-light flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-danger" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="md">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
