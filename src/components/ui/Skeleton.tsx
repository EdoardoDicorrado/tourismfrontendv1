import { cx } from "@/components/ui/buttonVariants";

/**
 * Skeleton — content placeholder for loading states. Shape/size come from
 * `className` (e.g. `h-4 w-32`, `size-12 rounded-full`); `animate-shimmer`
 * (defined in `globals.css`, owned by `animations`) sweeps a light sheen across
 * it via a GPU-composited `translateX` and auto-stops under
 * `prefers-reduced-motion`. Stays a Server Component (pure CSS, no framer).
 * `aria-hidden` — announce loading via a sibling `Spinner`/status.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx("block animate-shimmer rounded-card bg-soft-grey/40", className)} />;
}
