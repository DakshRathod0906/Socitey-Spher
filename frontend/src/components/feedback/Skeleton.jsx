import { cn } from "../../lib/utils";

const presets = {
  text: "h-4 rounded",
  heading: "h-6 w-3/4 rounded",
  avatar: "h-10 w-10 rounded-full",
  card: "h-32 rounded-xl",
  line: "h-3 rounded",
  button: "h-9 w-24 rounded-lg",
  image: "h-48 w-full rounded-xl",
};

export default function Skeleton({
  variant = "text",
  width,
  height,
  className,
  count = 1,
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={cn(
            "animate-shimmer",
            presets[variant],
            i > 0 && "mt-2",
            className
          )}
          style={{
            width: width || undefined,
            height: height || undefined,
          }}
        />
      ))}
    </>
  );
}

/** Ready-made skeleton layouts for common page patterns */
export function SkeletonCard({ className }) {
  return (
    <div className={cn("p-5 rounded-xl border border-border bg-card space-y-3", className)}>
      <Skeleton variant="heading" />
      <Skeleton variant="line" count={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-4 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-t border-border">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} variant="line" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
