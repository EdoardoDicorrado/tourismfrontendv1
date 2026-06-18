import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Pagination } from "@/components/account/ui";
import {
  DiscountCodesSearch,
  DiscountCodesTable,
  DiscountEmptyState,
} from "@/components/account/discounts";
import { getDiscountCodes } from "@/lib/account/client";
import { requireRole } from "@/lib/account/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };
type Search = { [key: string]: string | string[] | undefined };

/** searchParams values can be string | string[]; take the first occurrence. */
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
  return { title: `${dict.account.discountCodes.title} — TourisMotion` };
}

/**
 * Agency discount-codes list (`/[lang]/agenzie/codici-sconto`). Agency-only and
 * read-only: data comes server-side from the account client seam
 * (`getDiscountCodes`); no BFF write route is involved. Filterable by code/name
 * and paginated; each row links to the per-code usage and products views.
 */
export default async function DiscountCodesPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);
  const session = guard.session;

  const dict = await getDictionary(lang);
  const slice = dict.account.discountCodes;

  const sp = await searchParams;
  const code = first(sp.code).trim();
  const name = first(sp.name).trim();
  const pageNum = Math.max(1, parseInt(first(sp.page), 10) || 1);

  // SEAM: read-only data from the account client, scoped by the session token.
  const { items: codes, meta } = await getDiscountCodes({
    token: session.token,
    code,
    name,
    page: pageNum,
  });

  const action = `/${lang}/agenzie/codici-sconto`;
  // Preserve active filters across pagination.
  const filterQuery = [
    code ? `code=${encodeURIComponent(code)}` : "",
    name ? `name=${encodeURIComponent(name)}` : "",
  ]
    .filter(Boolean)
    .join("&");
  const pageBaseHref = filterQuery ? `${action}?${filterQuery}` : action;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="discountCodes">
      <header className="mb-6">
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{slice.title}</h2>
      </header>

      <div className="mb-6 rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
        <DiscountCodesSearch action={action} code={code} name={name} dict={slice} />
      </div>

      {codes.length > 0 ? (
        <>
          <DiscountCodesTable codes={codes} dict={slice} lang={lang} />
          <Pagination
            current_page={meta.current_page}
            per_page={meta.per_page}
            total={meta.total}
            baseHref={pageBaseHref}
            ariaLabel={slice.title}
          />
        </>
      ) : (
        <DiscountEmptyState>{slice.empty}</DiscountEmptyState>
      )}
    </AccountLayout>
  );
}
