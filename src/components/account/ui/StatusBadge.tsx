import type { ReactNode } from "react";

/**
 * Pill badge for booking / item status. There is no generic Badge in the repo,
 * so this replicates the design-system pill pattern mapped onto existing tokens
 * (no dedicated "success" green — confirmed/current uses `cta`):
 *   - confirmed / current / paid → `bg-cta/10 text-cta`
 *   - travelled / pending       → `bg-soft-grey/40 text-ink/70`
 *   - cancelled                 → `bg-badge/10 text-badge`
 *
 * The label text is passed in (already localized via `dict.account.status.*`);
 * `tone` controls the colors. Map a value to a tone with `bookingStatusTone`
 * (reservation `state`), `paymentStatusTone` (`payment_status`), or
 * `lineBadgeTone` (line `state`).
 */
export type BadgeTone = "current" | "neutral" | "danger";

const TONE: Record<BadgeTone, string> = {
  current: "bg-cta/10 text-cta",
  neutral: "bg-soft-grey/40 text-ink/70",
  danger: "bg-badge/10 text-badge",
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
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${TONE[tone]} ${className}`.trim()}
    >
      {children}
    </span>
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
