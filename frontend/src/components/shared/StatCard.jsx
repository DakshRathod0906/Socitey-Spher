import { cn } from "../../lib/utils";
import { Card } from "../ui";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  className,
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <h3 className="text-2xl font-bold text-text mt-2">{value}</h3>
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>

      {(trendValue || trendLabel) && (
        <div className="mt-4 flex items-center text-sm">
          {trendValue && (
            <span
              className={cn(
                "inline-flex items-center font-medium",
                isPositive && "text-success",
                isNegative && "text-danger"
              )}
            >
              {isPositive && <ArrowUpRight className="h-4 w-4 mr-0.5" />}
              {isNegative && <ArrowDownRight className="h-4 w-4 mr-0.5" />}
              {trendValue}
            </span>
          )}
          {trendLabel && (
            <span className="text-muted ml-2">{trendLabel}</span>
          )}
        </div>
      )}
    </Card>
  );
}
