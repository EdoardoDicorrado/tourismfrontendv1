import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AccountLayout } from "@/components/account/AccountLayout";
import { Pagination } from "@/components/account/ui";
import { DiscountCodeProductsTable, DiscountEmptyState } from "@/components/account/discounts";
import { getDiscountCodeProducts, getDiscountCodes } from "@/lib/account/client";
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
  return {
    title: `${dict.account.discountCodeProducts.title.replace("{code}", "")} — TourisMotion`,
  };
}

/**
 * Products a discount code applies to
 * (`/[lang]/agenzie/codici-sconto/[id]/prodotti`). Agency-only, read-only.
 *
 * Scope gate: `getDiscountCodeProducts` returns `null` when the code isn't the
 * agency's (or doesn't exist) — redirect back to the list. The heading's
 * human-readable code label is resolved via the codes list.
 */
export default async function DiscountCodeProductsPage({
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
  const slice = dict.account.discountCodeProducts;

  const sp = await searchParams;
  const pageNum = Math.max(1, parseInt(first(sp.page), 10) || 1);

  const listHref = `/${lang}/agenzie/codici-sconto`;

  // The route `id` is the Offer id (product scope is keyed by offer_id).
  // SEAM (read-only). `null` ⇒ code not in this agency's scope ⇒ back to list.
  const products = await getDiscountCodeProducts(id, { token: session.token, page: pageNum });
  if (!products) redirect(listHref);

  const { items: allCodes } = await getDiscountCodes({ token: session.token, page: 1 });
  const codeLabel = allCodes.find((c) => c.offer_id === id)?.code ?? id;

  return (
    <AccountLayout lang={lang} dict={dict} session={session} active="discountCodes">
      <div className="mb-6">
        <Link href={listHref} className="text-sm font-bold text-cta hover:underline">
          ← {slice.back}
        </Link>
        <h2 className="mt-2 text-xl font-extrabold text-ink sm:text-2xl">
          {fill(slice.title, { code: codeLabel })}
        </h2>
      </div>

      {products.all_products ? (
        <DiscountCodeProductsTable rows={[]} allProducts dict={slice} />
      ) : products.items.length > 0 ? (
        <>
          <DiscountCodeProductsTable rows={products.items} allProducts={false} dict={slice} />
          <Pagination
            current_page={products.meta.current_page}
            per_page={products.meta.per_page}
            total={products.meta.total}
            baseHref={`${listHref}/${id}/prodotti`}
            ariaLabel={slice.title.replace("{code}", codeLabel)}
          />
        </>
      ) : (
        <DiscountEmptyState>{slice.empty}</DiscountEmptyState>
      )}
    </AccountLayout>
  );
}
