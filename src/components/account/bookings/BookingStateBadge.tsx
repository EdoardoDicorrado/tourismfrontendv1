"use client";

import { StatusBadge, bookingStatusTone } from "@/components/account/ui";
import { useCancelledBookings } from "@/lib/account/cancelledBookings";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { statusLabel } from "./status";

/**
 * Booking reservation-state badge, with a PREVIEW client override: if the user
 * has "cancelled" this booking locally (see {@link useCancelledBookings}), it
 * renders the "cancelled" state regardless of the server `state`. Server state is
 * the source of truth everywhere else.
 */
export function BookingStateBadge({
  uuid,
  state,
  statusDict,
}: {
  uuid: string;
  state: string;
  statusDict: Dictionary["account"]["status"];
}) {
  const cancelled = useCancelledBookings();
  const effective = cancelled.has(uuid) ? "cancelled" : state;
  return (
    <StatusBadge tone={bookingStatusTone(effective)}>
      {statusLabel(statusDict, effective)}
    </StatusBadge>
  );
}
