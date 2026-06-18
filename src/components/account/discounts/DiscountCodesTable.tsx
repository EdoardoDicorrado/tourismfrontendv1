import Link from "next/link";

import { StatusBadge } from "@/components/account/ui";
import { fill } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { DiscountCode } from "@/lib/account/types";

import { codeDiscountLabel, formatDate, usesLabel } from "./format";

/**
 * Discount-code list, rendered as responsive cards (the repo doesn't use real
 * `<table>` elements). Each card shows code, internal name, the discount
 * (percent or fixed amount), the validity window, used/left quantities (with ∞
 * for an uncapped code), a "valid now"/"expired" badge, an optional
 * "not combinable" flag, and links to the per-code usage and products views.
 *
 * Read-only — owned by the discount-codes feature. Receives the narrowed
 * `dict.account.discountCodes` slice plus `lang` for date formatting and link
 * locale prefixing. NB the usage link is keyed by `offer_code_id` (the specific
 * code) while the products link is keyed by `offer_id` (the parent offer); the
 * products link is omitted when the row has no `offer_id`.
 */
export function DiscountCodesTable({
  codes,
  dict,
  lang,
}: {
  codes: DiscountCode[];
  dict: Dictionary["account"]["discountCodes"];
  lang: Locale;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {codes.map((code) => (
        <li
          key={code.offer_code_id}
          className="rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-ink">{code.code}</span>
                <span className="inline-flex items-center rounded-[5px] bg-cta px-2 py-0.5 text-xs font-extrabold text-white">
                  {codeDiscountLabel(code, lang)}
                </span>
                {!code.combinable_with_agency_discount ? (
                  <span className="inline-flex items-center rounded-full bg-soft-grey/40 px-2.5 py-1 text-xs font-bold text-ink/70">
                    {dict.notCombinable}
                  </span>
                ) : null}
              </div>
              {code.internal_name ? (
                <p className="mt-1 text-sm text-ink/70">{code.internal_name}</p>
              ) : null}
            </div>
            <StatusBadge tone={code.is_valid_now ? "current" : "neutral"}>
              {code.is_valid_now ? dict.validNow : dict.expired}
            </StatusBadge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-soft-grey pt-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {dict.colValidity}
              </dt>
              <dd className="mt-0.5 text-sm text-ink">
                {fill(dict.validityRange, {
                  from: formatDate(code.valid_from, lang),
                  to: formatDate(code.valid_until, lang),
                })}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {dict.colUsed}
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">
                {usesLabel(code.used_count, code.max_uses, dict.unlimited)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink/60">
                {dict.colLeft}
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-ink">
                {code.remaining ?? dict.unlimited}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-soft-grey pt-4">
            <Link
              href={`/${lang}/agenzie/codici-sconto/${code.offer_code_id}/utilizzo`}
              className="rounded-[10px] border border-cta px-4 py-2 text-sm font-extrabold text-cta transition-colors hover:bg-cta hover:text-white"
            >
              {dict.viewUsage}
            </Link>
            {code.offer_id ? (
              <Link
                href={`/${lang}/agenzie/codici-sconto/${code.offer_id}/prodotti`}
                className="rounded-[10px] border border-cta px-4 py-2 text-sm font-extrabold text-cta transition-colors hover:bg-cta hover:text-white"
              >
                {dict.viewProducts}
              </Link>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
