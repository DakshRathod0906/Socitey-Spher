import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropdown({
  trigger,
  items = [],
  align = "left",
  className,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={cn("relative inline-block", className)} ref={ref}>
      {/* Trigger */}
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger || (
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-surface hover:bg-secondary-light transition-colors">
            Options
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-fast", open && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-dropdown mt-1.5 min-w-[180px] rounded-lg border border-border bg-card shadow-lg py-1",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {items.map((item, i) =>
              item.type === "separator" ? (
                <div key={i} className="my-1 border-t border-border" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                    "hover:bg-secondary-light",
                    item.danger && "text-danger hover:bg-danger-light",
                    !item.danger && "text-text",
                    item.disabled && "opacity-50 pointer-events-none"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
