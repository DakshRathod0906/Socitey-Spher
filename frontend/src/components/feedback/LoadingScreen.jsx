import { cn } from "../../lib/utils";
import Spinner from "../ui/Spinner";

export default function LoadingScreen({
  message = "Loading...",
  fullScreen = true,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "fixed inset-0 z-overlay bg-background",
        !fullScreen && "py-20",
        className
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm text-muted animate-pulse">{message}</p>
    </div>
  );
}
