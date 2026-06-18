import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { DiscountCodeUsage } from "@/lib/account/types";

import { formatCents, formatDateTime } from "./format";

/**
 * Usage rows for a discount code — the reservations that applied it (from
 * `reservation_offers`). Rendered as responsive cards (no real `<table>` in the
 * repo): booking code + applied state on top, then the customer (an opaque email
 * hash — the agency never sees the buyer's address), the applied amount (snapshot
 * cents in the code's currency) and the "used at" timestamp. Read-only.
 */
export function DiscountCodeUsageTable({
  rows,
  dict,
  lang,
}: {
  rows: DiscountCodeUsage[];
  dict: Dictionary["account"]["discountCodeUsage"];
  lang: Locale;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((row, i) => (
        <li
          key={`${row.reservation_uuid ?? row.booking_code ?? "row"}-${i}`}
          className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-extrabold text-ink">{row.booking_code ?? "—"}</span>
            {row.applied_at_state ? (
              <span className="inline-flex items-center rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink">
                {row.applied_at_state}
              </span>
            ) : null}
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 border-t border-soft-grey pt-3 sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {dict.colCustomer}
              </dt>
              <dd className="mt-0.5 truncate font-mono text-xs text-ink/70">
                {row.customer_email_hash ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {dict.colAmount}
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">
                {formatCents(row.snapshot_amount_applied_cents, row.currency, lang)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {dict.colUsedAt}
              </dt>
              <dd className="mt-0.5 text-sm text-ink">{formatDateTime(row.created_at, lang)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
