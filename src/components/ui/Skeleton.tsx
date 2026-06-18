import { cx } from "@/components/ui/buttonVariants";

/**
 * Skeleton — content placeholder for loading states. This is the STRUCTURE
 * (shape/size via `className`, e.g. `h-4 w-32`, `size-12 rounded-full`); the
 * baseline pulse is Tailwind's `animate-pulse`. A richer shimmer is `animations`'
 * to swap in. `aria-hidden` — announce loading via a sibling `Spinner`/status.
 */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cx("block animate-pulse rounded-card bg-soft-grey/40", className)} />;
}
