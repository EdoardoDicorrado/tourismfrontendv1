import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Alert — inline feedback message (form success/error, notices). The single
 * source for the tinted-message pattern; `account/ui/Flash` delegates here.
 * Colors map onto tokens (success intentionally reuses `cta`, not green):
 *   - success → `bg-cta/10 text-cta`     (role="status")
 *   - error   → `bg-badge/10 text-badge` (role="alert")
 *   - warning → `bg-warning/15 text-ink` (role="status")
 *   - info    → `bg-soft text-ink/70`    (role="status")
 *
 * Server-safe. Render conditionally from the caller.
 */
export type AlertVariant = "success" | "error" | "warning" | "info";

const VARIANT: Record<AlertVariant, { className: string; role: "status" | "alert" }> = {
  success: { className: "bg-cta/10 text-cta", role: "status" },
  error: { className: "bg-badge/10 text-badge", role: "alert" },
  warning: { className: "bg-warning/15 text-ink", role: "status" },
  info: { className: "bg-soft text-ink/70", role: "status" },
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
