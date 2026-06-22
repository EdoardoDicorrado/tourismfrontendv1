/**
 * Booking status helpers — localized labels + editability rules.
 *
 * The reservation has TWO orthogonal status axes (contract): `state` (lifecycle:
 * pending/on_hold/confirmed/cancelled/expired/redeemed) and `payment_status`
 * (paid/partial/open/overpaid). Lines carry their own `state` (active/cancelled).
 * `dict.account.status` holds a label for every one of those keys; we look them
 * up dynamically with a safe fallback to the raw key.
 */
import type { Booking, BookingCustomer, BookingLine } from "@/lib/account/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type StatusDict = Dictionary["account"]["status"];

/** Localized label for any status key, falling back to the raw key when unknown. */
export function statusLabel(dict: StatusDict, key: string): string {
  return (dict as Record<string, string>)[key] ?? key;
}

/** Reservation lifecycle states in which the booking can still be edited. */
const EDITABLE_STATES = new Set(["pending", "on_hold", "confirmed"]);

/**
 * Whether the booking can be edited from the storefront: a non-terminal state
 * AND at least one active line. The backend remains the authority (a PATCH on a
 * locked booking still returns `403 booking_not_editable`); this only governs
 * whether we render the editable form vs. a read-only view.
 */
export function isBookingEditable(booking: Booking): boolean {
  return EDITABLE_STATES.has(booking.state) && booking.lines.some(isLineEditable);
}

/** A line can be cancelled while it's still active. */
export function isLineEditable(line: BookingLine): boolean {
  return line.state === "active";
}

/**
 * Whether the WHOLE booking can still be cancelled from the storefront: a
 * non-terminal state with at least one active line whose slot is still in the
 * future ("non ancora effettuata"). The real cancellation terms (free-cancel
 * window) are enforced by the backend (403 on a locked booking) — this only
 * gates whether the "Cancella prenotazione" button renders.
 */
export function isBookingCancellable(booking: Booking): boolean {
  if (!EDITABLE_STATES.has(booking.state)) return false;
  const now = Date.now();
  return booking.lines.some(
    (l) => l.state === "active" && l.slot_start != null && Date.parse(l.slot_start) > now,
  );
}

/** "Mario Rossi" / email / "" — display name for the reservation customer. */
export function customerName(customer: BookingCustomer): string {
  const full = [customer.first_name, customer.last_name].filter(Boolean).join(" ").trim();
  return full || customer.email || "";
}
