"use client";

import { useState } from "react";

import { Flash } from "@/components/account/ui";
import { markBookingCancelled, useCancelledBookings } from "@/lib/account/cancelledBookings";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Cancel the WHOLE booking. Two-step: a red outline trigger reveals an inline
 * confirm, then a destructive confirm.
 *
 * PREVIEW: there is no customer cancellation endpoint yet, so this does NOT delete
 * anything — it records the booking id in a client store ({@link
 * markBookingCancelled}) and shows the success banner. The booking row stays on
 * screen and its state badge flips confirmed → cancelled (see BookingStateBadge).
 * Swap the local mark for a real DELETE BFF call once the backend lands
 * (full-stack) — that call will also need the locale, re-add it as a prop then.
 *
 * Client component: useState for the confirm step; React Compiler is ON.
 */
export function CancelBookingButton({
  bookingId,
  dict,
}: {
  bookingId: string;
  dict: Dictionary["account"];
}) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const cancelled = useCancelledBookings();

  function handleConfirm() {
    // PREVIEW: mark locally instead of deleting — the badge flips, nothing is sent.
    markBookingCancelled(bookingId);
    setDone(true);
  }

  // Just cancelled this session: a full-width success banner replaces the action.
  if (done) {
    return (
      <Flash variant="success" className="w-full">
        {dict.bookingDetail.cancelBookingRequested}
      </Flash>
    );
  }

  // Already cancelled (e.g. re-rendered after navigation): hide the action — the
  // state badge already shows "cancelled".
  if (cancelled.has(bookingId)) return null;

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-[10px] border border-badge px-5 py-2.5 text-sm font-extrabold text-badge transition-colors hover:bg-badge hover:text-white"
      >
        {dict.bookingDetail.cancelBooking}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ink">{dict.bookingDetail.cancelBookingConfirm}</p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-[10px] bg-badge px-4 py-2 text-sm font-extrabold text-white transition-colors hover:bg-badge/90"
        >
          {dict.bookingDetail.cancelBooking}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm font-semibold text-ink/70 hover:text-ink"
        >
          {dict.bookingDetail.back}
        </button>
      </div>
    </div>
  );
}
