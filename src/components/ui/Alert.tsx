import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Alert — inline feedback message (form success/error, notices). The single
 * source for the tinted-message pattern; `account/ui/Flash` delegates here.
 * Colors map onto tokens (success intentionally reuses `cta`, not green):
 *   - success → `bg-cta/10 text-cta`     (role="status")
 *   - error   → `bg-badge/10 text-badge` (role="alert")
 *   - warning → `bg-warning/15 text-ink` (role="status")
 *   - info    → `bg-soft text-ink`       (role="status")
 *
 * Server-safe. Render conditionally from the caller.
 */
export type AlertVariant = "success" | "error" | "warning" | "info";

/**
 * Shared feedback semantics (variant → semantic token name) — single source so
 * Alert tints and Toast dots can't drift. `success`/`info` reuse `cta`
 * (success intentionally not green), `error` → `badge`, and `warning` maps to
 * the accessible `warning-strong` token (the raw `warning` color is tint-only
 * and fails contrast as a solid fill/dot).
 */
export const FEEDBACK = {
  success: "cta",
  error: "badge",
  warning: "warning-strong",
  info: "cta",
} as const satisfies Record<AlertVariant, string>;

const VARIANT: Record<AlertVariant, { className: string; role: "status" | "alert" }> = {
  success: { className: "bg-cta/10 text-cta", role: "status" },
  error: { className: "bg-badge/10 text-badge", role: "alert" },
  warning: { className: "bg-warning/15 text-ink", role: "status" },
  info: { className: "bg-soft text-ink", role: "status" },
};

export function Alert({
  children,
  variant = "info",
  className,
}: {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
}) {
  const v = VARIANT[variant];
  return (
    <div role={v.role} className={cx("rounded-card px-4 py-3 text-sm font-semibold", v.className, className)}>
      {children}
    </div>
  );
}
