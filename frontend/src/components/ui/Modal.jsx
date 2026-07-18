import { useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export default function Modal({
  open = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  closeOnOverlay = true,
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={closeOnOverlay ? onClose : undefined}
          />
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "relative w-full rounded-xl bg-card shadow-xl border border-border",
              sizeStyles[size],
              className
            )}
          >
            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-start justify-between p-5 pb-0">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-text">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-muted mt-1">{description}</p>
                  )}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-muted hover:text-text hover:bg-secondary-light transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {/* Body */}
            <div className="p-5">{children}</div>
            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
