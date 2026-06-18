import {
  StatusBadge,
  bookingStatusTone,
  lineBadgeTone,
  paymentStatusTone,
} from "@/components/account/ui";
import { ButtonLink } from "@/components/ui/Button";
import { formatMoney } from "@/lib/format";
import type { Booking } from "@/lib/account/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

import { VoucherLink } from "./VoucherLink";
import { formatDateShort, formatStartAt } from "./datetime";
import { customerName, statusLabel } from "./status";

/**
 * One booking summarised as a card (used by both the customer and agency
 * lists — identical, only the base path differs). Shows the code + the two status
 * axes (reservation state + payment status), the created date, the customer, the
 * booked slots (with per-line status badge), the total, and the actions (detail
 * link + voucher).
 *
 * Server component: no client state. The detail link points at `detailBase/{uuid}`
 * so the same card works under `/area/prenotazioni` and `/agenzie/prenotazioni`.
 */
export function BookingCard({
  booking,
  lang,
  dict,
  detailBase,
}: {
  booking: Booking;
  lang: Locale;
  dict: Dictionary["account"];
  /** Detail route prefix, e.g. `/it/area/prenotazioni`. */
  detailBase: string;
}) {
  const createdDate = formatDateShort(booking.created_at, lang);
  const totalEuros = booking.total.amount_cents / 100;

  return (
    <article className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">{dict.bookings.code}</p>
          <p className="text-lg font-extrabold text-ink">{booking.code}</p>
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

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">{dict.bookings.date}</dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">{createdDate}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
            {dict.bookings.customer}
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">
            {customerName(booking.customer) || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
            {dict.bookings.total}
          </dt>
          <dd className="mt-0.5 text-sm font-extrabold text-ink">
            {formatMoney(totalEuros, lang)}
          </dd>
        </div>
      </dl>

      {booking.lines.length > 0 ? (
        <div className="mt-4 border-t border-soft-grey pt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/60">{dict.bookings.lines}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {booking.lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm text-ink"
              >
                <span className="min-w-0">
                  <span className="font-bold">{line.product_name ?? "—"}</span>
                  <span className="text-ink/70"> · {formatStartAt(line.slot_start, lang)}</span>
                </span>
                <StatusBadge tone={lineBadgeTone(line.state)}>
                  {statusLabel(dict.status, line.state)}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <ButtonLink href={`${detailBase}/${booking.uuid}`} size="sm">
          {dict.bookings.view}
        </ButtonLink>
        <VoucherLink bookingId={booking.uuid} label={dict.bookings.voucher} />
      </div>
    </article>
  );
}
