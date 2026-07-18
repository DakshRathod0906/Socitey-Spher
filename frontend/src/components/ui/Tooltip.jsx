import { useState } from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Tooltip({
  children,
  content,
  side = "top",
  className,
}) {
  const [show, setShow] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const origins = {
    top: { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 } },
    bottom: { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 4 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -4 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && content && (
          <motion.div
            initial={origins[side].initial}
            animate={origins[side].animate}
            exit={origins[side].initial}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-tooltip px-2.5 py-1.5 text-xs font-medium rounded-md",
              "bg-slate-900 text-white whitespace-nowrap pointer-events-none",
              positions[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
