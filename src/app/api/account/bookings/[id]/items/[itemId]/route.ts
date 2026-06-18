import { NextResponse, type NextRequest } from "next/server";

import { cancelBookingLine } from "@/lib/account/client";
import { getSession } from "@/lib/account/session";
import { BackendError } from "@/lib/api/client";

/**
 * Cancel-line BFF (`DELETE /api/account/bookings/{id}/items/{itemId}`).
 *
 * `itemId` is a ReservationLine id (a single slot). ARCHITECTURE (CLAUDE.md):
 * tatanka3 is the single writer. This route enforces the session scope and
 * proxies to the account seam (`cancelBookingLine` → backend
 * `DELETE /account/bookings/{uuid}/lines/{lineId}` with the bearer token + a
 * mandatory `Idempotency-Key`). EDITABILITY IS ENFORCED BY THE BACKEND: a line
 * that can't be cancelled comes back as `403 booking_not_editable` (mapped to
 * `not_editable`); a missing booking/line is `404`. On success the backend
 * returns the refreshed booking, which we hand back so the client can refresh.
 */

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await ctx.params;

  // Gate: authenticated. Line/booking ownership is enforced by the backend
  // (the user-scoped token only resolves the user's own reservations).
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const booking = await cancelBookingLine(id, itemId, session.token);
    if (!booking) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    if (err instanceof BackendError && err.status === 403) {
      return NextResponse.json({ ok: false, error: "not_editable" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "cancel_failed" }, { status: 502 });
  }
}
