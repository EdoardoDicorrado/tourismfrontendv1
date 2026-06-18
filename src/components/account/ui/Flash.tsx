import type { ReactNode } from "react";

/**
 * Inline flash / alert message. Maps onto existing design tokens (there is no
 * "success" green — success reuses `cta`):
 *   - success → `bg-cta/10 text-cta`        (role="status")
 *   - error   → `bg-badge/10 text-badge`    (role="alert")
 *   - info    → `bg-soft text-ink/70`       (role="status")
 *
 * No interactivity — safe as a server component, but importable from client
 * components too. Render conditionally from the caller (`{error && <Flash …/>}`).
 */
export type FlashVariant = "success" | "error" | "info";

const VARIANT: Record<FlashVariant, { className: string; role: "status" | "alert" }> = {
  success: { className: "bg-cta/10 text-cta", role: "status" },
  error: { className: "bg-badge/10 text-badge", role: "alert" },
  info: { className: "bg-soft text-ink/70", role: "status" },
};

export function Flash({
  children,
  variant = "info",
  className = "",
}: {
  children: ReactNode;
  variant?: FlashVariant;
  className?: string;
}) {
  const v = VARIANT[variant];
  return (
    <p
      role={v.role}
      className={`rounded-[10px] px-4 py-3 text-sm font-semibold ${v.className} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
