import Link from "next/link";

import { StatusBadge, bookingStatusTone, paymentStatusTone } from "@/components/account/ui";
import { formatMoney } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Booking } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { BookingEditForm } from "./BookingEditForm";
import { VoucherLink } from "./VoucherLink";
import { isBookingEditable, statusLabel } from "./status";

/**
 * Booking detail view: header (code + state + payment status + total +
 * back/voucher actions) and the {@link BookingEditForm} (participants + the
 * per-reservation hotel/pickup/dropoff, with per-slot cancel). Shared by the
 * customer and agency detail pages — only `listBase` (the "back to list" target)
 * differs.
 *
 * Server component: receives the already-fetched booking. Editing is disabled
 * (read-only form) once the reservation is in a terminal state or has no active
 * line; the backend remains the authority and rejects a locked PATCH with 403.
 */
export function BookingDetail({
  booking,
  lang,
  dict,
  listBase,
}: {
  booking: Booking;
  lang: Locale;
  dict: Dictionary["account"];
  /** Bookings list route for the back link, e.g. `/it/area/prenotazioni`. */
  listBase: string;
}) {
  const editable = isBookingEditable(booking);
  const totalEuros = booking.total.amount_cents / 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={listBase}
          className="text-sm font-semibold text-cta hover:underline"
        >
          ← {dict.bookingDetail.back}
        </Link>
      </div>

      <div className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
              {fill(dict.bookingDetail.title, { code: booking.code })}
            </h1>
            <p className="mt-1 text-sm font-extrabold text-ink">{formatMoney(totalEuros, lang)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={bookingStatusTone(booking.state)}>
              {statusLabel(dict.status, booking.state)}
            </StatusBadge>
            <StatusBadge tone={paymentStatusTone(booking.payment_status)}>
              {statusLabel(dict.status, booking.payment_status)}
            </StatusBadge>
          </div>
        </div>
        <div className="mt-4 border-t border-soft-grey pt-4">
          <VoucherLink bookingId={booking.uuid} label={dict.bookingDetail.voucher} />
        </div>
      </div>

      <BookingEditForm booking={booking} editable={editable} lang={lang} dict={dict} />
    </div>
  );
}
