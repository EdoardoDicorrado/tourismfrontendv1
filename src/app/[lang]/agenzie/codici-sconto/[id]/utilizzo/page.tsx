import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Pagination } from "@/components/account/ui";
import { DiscountCodeUsageTable, DiscountEmptyState } from "@/components/account/discounts";
import { getDiscountCodes, getDiscountCodeUsage } from "@/lib/account/client";
import { requireRole } from "@/lib/account/session";
import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string; id: string };
type Search = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: `${dict.account.discountCodeUsage.title.replace("{code}", "")} — TourisMotion` };
}

/**
 * Usage detail for one discount code (`/[lang]/agenzie/codici-sconto/[id]/utilizzo`):
 * the bookings/time-slots that applied the code. Agency-only, read-only.
 *
 * Scope gate: `getDiscountCodeUsage` returns `null` when the code is not the
 * agency's (or doesn't exist) — we redirect back to the list, mirroring the
 * backend's 403/redirect. The human-readable code label for the heading is
 * resolved via the codes list (the usage seam doesn't carry it).
 */
export default async function DiscountCodeUsagePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const dict = await getDictionary(lang);
  const slice = dict.account.discountCodeUsage;

  const sp = await searchParams;
  const pageNum = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const listHref = `/${lang}/agenzie/codici-sconto`;

  // SEAM (read-only). `null` ⇒ code not in this agency's scope ⇒ back to list.
  // The route `id` is the OfferCode id (usage is keyed by offer_code_id).
  const usage = await getDiscountCodeUsage(id, { token: session.token, page: pageNum });
  if (!usage) redirect(listHref);

  // Resolve the human code label for the heading (usage rows don't include it).
  const { items: allCodes } = await getDiscountCodes({ token: session.token, page: 1 });
  const codeLabel = allCodes.find((c) => c.offer_code_id === id)?.code ?? id;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="discountCodes">
      <div className="mb-6">
        <Link
          href={listHref}
          className="text-sm font-bold text-cta hover:underline"
        >
          ← {slice.back}
        </Link>
        <h2 className="mt-2 text-xl font-extrabold text-ink sm:text-2xl">
          {fill(slice.title, { code: codeLabel })}
        </h2>
      </div>

      {usage.items.length > 0 ? (
        <>
          <DiscountCodeUsageTable rows={usage.items} dict={slice} lang={lang} />
          <Pagination
            current_page={usage.meta.current_page}
            per_page={usage.meta.per_page}
            total={usage.meta.total}
            baseHref={`${listHref}/${id}/utilizzo`}
            ariaLabel={slice.title.replace("{code}", codeLabel)}
          />
        </>
      ) : (
        <DiscountEmptyState>{slice.empty}</DiscountEmptyState>
      )}
    </AccountLayout>
  );
}
