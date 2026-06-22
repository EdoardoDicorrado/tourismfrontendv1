import { cx } from "@/components/ui/buttonVariants";

/**
 * Spinner — indeterminate loading indicator (ring). `role="status"` with an
 * accessible label. Uses Tailwind's built-in `animate-spin` for the rotation.
 * Under `prefers-reduced-motion` the global reset in `globals.css` would freeze
 * the spin (looks broken), so that file swaps in a reduced-motion-safe opacity
 * pulse for `.animate-spin` — the loading cue survives without vestibular motion.
 */
export function Spinner({
  size = 20,
  className,
  label = "Cargando…",
  tone = "cta",
}: {
  size?: number;
  className?: string;
  label?: string;
  tone?: "cta" | "inverse";
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cx(
        "inline-block animate-spin rounded-full border-2 border-soft",
        tone === "inverse" ? "border-t-white" : "border-t-cta",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
