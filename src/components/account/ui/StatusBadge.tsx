import type { ReactNode } from "react";

import { Badge, type BadgeTone as UIBadgeTone } from "@/components/ui/Badge";

/**
 * Pill badge for booking / item status — a thin wrapper over the Design System
 * `Badge` (`variant="soft"`). Keeps its semantic tone names + mapping helpers;
 * the colors come from the single Badge primitive (no dedicated "success" green
 * — confirmed/current intentionally uses `cta`):
 *   - confirmed / current / paid → `cta`     → `bg-cta/10 text-cta`
 *   - travelled / pending        → `neutral` → `bg-soft-grey/40 text-ink/70`
 *   - cancelled                  → `danger`  → `bg-badge/10 text-badge`
 *
 * The label text is passed in (already localized via `dict.account.status.*`);
 * `tone` controls the colors. Map a value to a tone with `bookingStatusTone`
 * (reservation `state`), `paymentStatusTone` (`payment_status`), or
 * `lineBadgeTone` (line `state`).
 */
export type BadgeTone = "current" | "neutral" | "danger";

/** Maps the semantic status tone onto the generic Badge tone. */
const TO_UI_TONE: Record<BadgeTone, UIBadgeTone> = {
  current: "cta",
  neutral: "neutral",
  danger: "badge",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <Badge variant="soft" tone={TO_UI_TONE[tone]} className={className}>
      {children}
    </Badge>
  );
}

/**
 * Tone for a reservation line state (`active`/`cancelled`):
 * cancelled → danger, otherwise current.
 */
export function lineBadgeTone(state: string): BadgeTone {
  return state === "cancelled" ? "danger" : "current";
}

/**
 * Tone for a reservation lifecycle `state`:
 * cancelled/expired → danger, confirmed/redeemed → current, otherwise neutral
 * (pending/on_hold).
 */
export function bookingStatusTone(state: string): BadgeTone {
  if (state === "cancelled" || state === "expired") return "danger";
  if (state === "confirmed" || state === "redeemed") return "current";
  return "neutral";
}

/**
 * Tone for a derived `payment_status`:
 * open → danger, paid → current, otherwise neutral (partial/overpaid).
 */
export function paymentStatusTone(status: string): BadgeTone {
  if (status === "open") return "danger";
  if (status === "paid") return "current";
  return "neutral";
}
