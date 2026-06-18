import type { ReactNode } from "react";

import { Alert } from "@/components/ui/Alert";

/**
 * Inline flash / alert message — now a thin wrapper over the Design System
 * `Alert` (single source of truth). Kept so existing imports
 * (`import { Flash } from "@/components/account/ui"`) keep working. Same look:
 *   - success → cta tint (role="status")
 *   - error   → badge tint (role="alert")
 *   - info    → soft (role="status")
 */
export type FlashVariant = "success" | "error" | "info";

export function Flash({
  children,
  variant = "info",
  className = "",
}: {
  children: ReactNode;
  variant?: FlashVariant;
  className?: string;
}) {
  return (
    <Alert variant={variant} className={className}>
      {children}
    </Alert>
  );
}
