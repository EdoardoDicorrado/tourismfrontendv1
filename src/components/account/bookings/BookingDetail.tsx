import Link from "next/link";

import { StatusBadge, paymentStatusTone } from "@/components/account/ui";
import { formatMoney } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Booking } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { BookingEditForm } from "./BookingEditForm";
import { BookingStateBadge } from "./BookingStateBadge";
import { CancelBookingButton } from "./CancelBookingButton";
import { VoucherLink } from "./VoucherLink";
import { formatStartAt } from "./datetime";
import { isBookingCancellable, isBookingEditable, statusLabel } from "./status";

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
  const cancellable = isBookingCancellable(booking);
  const totalEuros = booking.total.amount_cents / 100;
  const d = dict.bookingDetail;
  const c = booking.customer;
  const buyerName = [c.first_name, c.last_name].filter(Boolean).join(" ");
  const hasBuyer = !!(buyerName || c.email || c.phone);

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
            <BookingStateBadge uuid={booking.uuid} state={booking.state} statusDict={dict.status} />
            <StatusBadge tone={paymentStatusTone(booking.payment_status)}>
              {statusLabel(dict.status, booking.payment_status)}
            </StatusBadge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-soft-grey pt-4">
          <VoucherLink bookingId={booking.uuid} label={dict.bookingDetail.voucher} />
          {cancellable ? (
            <CancelBookingButton bookingId={booking.uuid} dict={dict} />
          ) : null}
        </div>
      </div>

      {/* Acquirente (read-only): chi ha prenotato + recapiti di contatto. */}
      {hasBuyer ? (
        <section className="rounded-panel border border-soft-grey bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-ink">{d.buyerTitle}</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {buyerName ? (
              <div>
                <dt className="text-sm font-bold text-ink">{d.firstName}</dt>
                <dd className="text-sm text-ink/80">{buyerName}</dd>
              </div>
            ) : null}
            {c.email ? (
              <div>
                <dt className="text-sm font-bold text-ink">{d.email}</dt>
                <dd className="text-sm text-ink/80">{c.email}</dd>
              </div>
            ) : null}
            {c.phone ? (
              <div>
                <dt className="text-sm font-bold text-ink">{d.phone}</dt>
                <dd className="text-sm text-ink/80">{c.phone}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {/* Riepilogo opzioni (read-only): orari prenotati con tariffe e totale. */}
      <section className="rounded-panel border border-soft-grey bg-white p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-ink">{d.summaryTitle}</h2>
        <div className="mt-4 flex flex-col gap-4">
          {booking.lines.map((line) => (
            <div
              key={line.id}
              className="flex flex-col gap-2 border-t border-soft-grey pt-4 first:border-t-0 first:pt-0"
            >
              <div>
                <p className="font-bold leading-snug text-ink">{line.product_name ?? "—"}</p>
                <p className="text-sm text-ink/70">
                  {formatStartAt(line.slot_start, lang)}
                  {line.option_name ? ` · ${line.option_name}` : ""}
                </p>
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {line.unit_items.map((u) => (
                  <li key={u.id} className="flex justify-between gap-3 text-ink">
                    <span>
                      {(u.unit_label ?? "—")} × {u.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatMoney(u.total.amount_cents / 100, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex justify-between gap-3 border-t border-soft-grey pt-4 font-extrabold text-ink">
            <span>{d.summaryTotal}</span>
            <span>{formatMoney(totalEuros, lang)}</span>
          </div>
        </div>
      </section>

      <BookingEditForm booking={booking} editable={editable} lang={lang} dict={dict} />
    </div>
  );
}
