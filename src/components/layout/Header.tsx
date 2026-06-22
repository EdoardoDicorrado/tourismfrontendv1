import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CartLink } from "@/components/layout/CartLink";
import { AccountMenu } from "@/components/account/AccountMenu";
import type { AgencyMenuData } from "@/components/account/AgencyMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { getPaymentInfo } from "@/lib/account/client";
import { getSession } from "@/lib/account/session";
import { getHomeDestinations, getListingAttractions, getListingProducts } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Identity for the agency avatar menu: name from the session, VAT fetched from the
 * payment seam. The storefront API may be absent in preview, so a failed/missing
 * VAT fetch degrades to name-only rather than breaking the whole header.
 */
async function getAgencyMenuData(): Promise<AgencyMenuData | null> {
  const session = await getSession();
  if (session?.role !== "agency") return null;
  let vatId: string | null = null;
  try {
    vatId = (await getPaymentInfo(session.token)).vat_id;
  } catch {
    // backend optional in preview — fall through to the demo VAT below
  }
  // ponytail: demo VAT so the design surfaces every agency data point before the
  // storefront payment API exists. Drop the fallback once the real value is wired.
  return { name: session.name, vatId: vatId ?? "IT01234567890" };
}

/**
 * Site header — logo, language, search, cart and login. Figma mobile node 64:5538,
 * desktop node 221:3191 (HEADER, 90px tall). Mobile: 44px bar (h-11), 96×22 logo,
 * actions icon-only with an 8px gap. Desktop (lg+): taller 90px bar with a 24px gap.
 * Text labels appear from `sm` up. The search trigger
 * ({@link HeaderSearch}) shows only on internal pages (hidden on the home hero).
 * Desktop's centered search-bar-in-header variant is deferred to ui-ux (layout).
 */
export async function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  // Search catalog feeding the header overlay (same sources as the home hero):
  // suggestions for the empty state + the list filtered live as the user types.
  // The getters fall back to local fixtures on backend failure → never throw.
  const [destinations, attractions, products, agency] = await Promise.all([
    getHomeDestinations(lang),
    getListingAttractions(lang),
    getListingProducts("roma", lang),
    getAgencyMenuData(),
  ]);

  return (
    <header className="border-b border-soft-grey bg-white">
      {/* Header desktop ridotto ~1/3 (Edoardo: la barra 1:1 90px era troppo grande):
          barra 60px (h-15), logo 112px (w-28), icone/label rimpicciolite nei sub. */}
      <Container className="flex h-11 items-center justify-between lg:h-15">
        <Link href={`/${lang}`} aria-label={dict.header.home}>
          <Image
            src="/images/logo-tourismotion.png"
            alt="TourisMotion"
            width={96}
            height={22}
            priority
            className="lg:h-auto lg:w-28"
          />
        </Link>

        <nav className="flex items-center gap-2 text-cta lg:gap-4">
          <LanguageSwitcher current={lang} variant="header" />

          <HeaderSearch
            lang={lang}
            dict={dict}
            destinations={destinations}
            attractions={attractions}
            products={products}
          />

          <CartLink label={dict.header.cart} />

          <AccountMenu lang={lang} dict={dict} agency={agency} />
        </nav>
      </Container>
    </header>
  );
}
