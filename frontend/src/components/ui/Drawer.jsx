import { useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

export default function Drawer({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "md",
  className,
}) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  const slideVariants = {
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
      position: "right-0",
    },
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      position: "left-0",
    },
  };

  const variant = slideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "absolute top-0 bottom-0 w-full bg-card shadow-xl flex flex-col",
              variant.position,
              sizeStyles[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border shrink-0">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-text">{title}</h2>
                )}
                {description && (
                  <p className="text-sm text-muted mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-muted hover:text-text hover:bg-secondary-light transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-5 border-t border-border shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
