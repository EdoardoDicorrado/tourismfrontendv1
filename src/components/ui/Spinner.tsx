import { cx } from "@/components/ui/buttonVariants";

/**
 * Spinner — indeterminate loading indicator (ring). `role="status"` with an
 * accessible label. Uses Tailwind's built-in `animate-spin` as the baseline
 * rotation; `animations` may standardize duration/easing via shared motion
 * tokens later.
 */
export function Spinner({
  size = 20,
  className,
  label = "Caricamento…",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx("inline-block animate-spin rounded-full border-2 border-soft border-t-cta", className)}
      style={{ width: size, height: size }}
    />
  );
}
