import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { CartLink } from "@/components/layout/CartLink";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Site header — logo, language, cart and login. Figma node 64:5538 (HEADER).
 * 60px tall (44px icon tap-targets + 8px padding), a 96×22 logo, and the three
 * actions in Figma order (globe → cart → avatar) with an 8px gap. Text labels
 * stay icon-only on mobile (matching Figma) and appear from `sm` up.
 */
export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
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
