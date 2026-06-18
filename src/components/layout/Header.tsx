import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CartLink } from "@/components/layout/CartLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { HeaderSearch } from "@/components/layout/HeaderSearch";
import { getHomeDestinations, getListingAttractions, getListingProducts } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Site header — logo, language, search, cart and login. Figma node 64:5538 (HEADER).
 * 60px tall (44px icon tap-targets + 8px padding), a 96×22 logo, and the actions in
 * Figma order (globe → search → cart → avatar) with an 8px gap. Text labels stay
 * icon-only on mobile (matching Figma) and appear from `sm` up. The search trigger
 * ({@link HeaderSearch}) shows only on internal pages (hidden on the home hero).
 */
export async function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  // Search catalog feeding the header overlay (same sources as the home hero):
  // suggestions for the empty state + the list filtered live as the user types.
  // The getters fall back to local fixtures on backend failure → never throw.
  const [destinations, attractions, products] = await Promise.all([
    getHomeDestinations(lang),
    getListingAttractions(lang),
    getListingProducts("roma", lang),
  ]);

  return (
    <header className="border-b border-soft-grey bg-white">
      <Container className="flex h-11 items-center justify-between">
        <Link href={`/${lang}`} aria-label={dict.header.home}>
          <Image
            src="/images/logo-tourismotion.png"
            alt="TourisMotion"
            width={96}
            height={22}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2 text-cta">
          <LanguageSwitcher current={lang} variant="header" />

          <HeaderSearch
            lang={lang}
            dict={dict}
            destinations={destinations}
            attractions={attractions}
            products={products}
          />

          <CartLink label={dict.header.cart} />

          <Link
            href={`/${lang}/accedi`}
            aria-label={dict.header.login}
            className="flex h-11 w-11 items-center justify-center gap-2 text-cta sm:w-auto sm:px-1"
          >
            <Image src="/images/icon-avatar.svg" alt="" width={24} height={24} unoptimized />
            <span className="hidden text-sm font-semibold sm:inline">{dict.header.login}</span>
          </Link>
        </nav>
      </Container>
    </header>
  );
}
