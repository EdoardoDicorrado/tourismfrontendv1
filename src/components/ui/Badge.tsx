import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Badge — the single source of truth for the small label/bubble patterns that
 * were previously redefined inline across the app. Three visual families:
 *
 *  - **solid** — filled label, `rounded-badge`, white text. Discount badges
 *    ("20% sulle Attività"): `tone="badge"` (red) or `tone="cta"` (teal).
 *  - **count** — round numeric bubble (`rounded-full`), white text. Cart/filter
 *    counters. Usually absolutely positioned by the caller (pass position +
 *    size via `className`).
 *  - **soft** — status pill with a 10% tinted background (`bg-tone/10 text-tone`).
 *    Booking/payment status, flashes.
 *
 * Pure presentational, no interactivity → safe in Server Components. Colors come
 * from the design tokens only (badge/cta/ink), never hex inline.
 */
export type BadgeVariant = "solid" | "count" | "soft";
export type BadgeTone = "badge" | "cta" | "neutral" | "ink";
export type BadgeSize = "sm" | "md";

const BASE: Record<BadgeVariant, string> = {
  solid: "inline-flex items-center rounded-badge px-2 py-1 font-extrabold leading-none",
  count: "inline-flex items-center justify-center rounded-full px-1 font-bold leading-none",
  soft: "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
};

/** Default text size per variant (overridable via `className`). */
const SIZE: Record<BadgeVariant, Record<BadgeSize, string>> = {
  solid: { md: "text-sm", sm: "text-xs" },
  count: { md: "text-[11px]", sm: "text-[10px]" },
  soft: { md: "", sm: "" }, // soft fixes text-xs in BASE
};

/** Literal Tailwind classes per (variant, tone) — kept static for the JIT. */
const TONE: Record<BadgeVariant, Partial<Record<BadgeTone, string>>> = {
  solid: {
    badge: "bg-badge text-white",
    cta: "bg-cta text-white",
    ink: "bg-ink text-white", // urgency/scarcity ("Si esaurisce in fretta")
  },
  count: {
    badge: "bg-badge text-white",
    cta: "bg-cta text-white",
    ink: "bg-ink text-white",
  },
  soft: {
    cta: "bg-cta/10 text-cta",
    badge: "bg-badge/10 text-badge",
    neutral: "bg-soft-grey/40 text-ink/70",
  },
};

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  children,
  variant = "solid",
  tone = "badge",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span className={cx(BASE[variant], SIZE[variant][size], TONE[variant][tone], className)}>
      {children}
    </span>
  );
}
