import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx for conditional classes.
 * This is the single utility used across all components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
