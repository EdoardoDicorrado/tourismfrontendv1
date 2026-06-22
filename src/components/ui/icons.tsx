import { cx } from "@/components/ui/buttonVariants";

/**
 * Shared SVG glyphs — ONE source per icon so the same shape isn't redrawn inline
 * with divergent viewBox/stroke across the app (the close × was hand-drawn 8 ways,
 * the caret 4 ways). Size + color come from `className` (currentColor). Decorative
 * by default (aria-hidden); the accessible name lives on the wrapping control
 * (e.g. `IconButton`'s `label`).
 */

/** Close / dismiss (×). */
export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cx("size-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Down caret for expand/collapse + native selects. Rotates 180° when `open`. */
export function CaretDown({ open = false, className }: { open?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cx("size-5", open && "rotate-180", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
