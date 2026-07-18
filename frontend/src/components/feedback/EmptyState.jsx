import { cn } from "../../lib/utils";
import { Inbox } from "lucide-react";
import Button from "../ui/Button";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
  actionLabel,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="h-16 w-16 rounded-2xl bg-primary-light flex items-center justify-center mb-5">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-5">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
