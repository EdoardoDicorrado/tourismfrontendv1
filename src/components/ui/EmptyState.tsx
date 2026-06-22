import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * EmptyState — canonical "no results / empty list" box. ONE treatment instead of
 * the per-page boxes that drifted (dashed-soft vs solid-white vs left-aligned
 * pill vs boxless hero). Centered, token radius + padding. `tone="soft"` (default,
 * dashed border on bg-soft — the most common look) or `"solid"` (white bordered).
 * Provide `title` / `description` / `action` slots.
 */
export interface EmptyStateProps {
  tone?: "soft" | "solid";
  icon?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const TONE: Record<NonNullable<EmptyStateProps["tone"]>, string> = {
  soft: "border border-dashed border-stroke bg-soft/40",
  solid: "border border-stroke-2 bg-white",
};

export function EmptyState({ tone = "soft", icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center gap-4 rounded-card px-6 py-12 text-center", TONE[tone], className)}>
      {icon ? <span className="text-ink/40">{icon}</span> : null}
      {title ? <p className="text-lg font-bold text-ink">{title}</p> : null}
      {description ? <p className="max-w-md text-sm text-ink/70">{description}</p> : null}
      {action}
    </div>
  );
}
