"use client";

import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OrderItems } from "@/components/cart/OrderItems";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Cart page body — booked items, removal, totals, and the path to checkout. */
export function CartView({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { items, hydrated, total, removeItem } = useCart();

  // Hold the layout until localStorage is read, so the empty state never flashes.
  if (!hydrated) {
    return (
      <Container className="py-16">
        <div className="h-40" aria-hidden />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.cart.title}</h1>
        <p className="mt-3 text-ink/70">{dict.cart.empty}</p>
        <ButtonLink href={`/${lang}/attivita/roma`} size="md" className="mt-6">
          {dict.cart.emptyCta}
        </ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.cart.title}</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-[15px] border border-soft-grey bg-white p-4 sm:p-6">
          <OrderItems items={items} lang={lang} dict={dict} onRemove={removeItem} />
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-[15px] bg-soft p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-ink">{dict.cart.summaryTitle}</h2>
            <div className="mt-4 flex items-center justify-between border-t border-soft-grey pt-4 text-lg font-extrabold text-ink">
              <span>{dict.cart.total}</span>
              <span>{formatMoney(total, lang)}</span>
            </div>
            <ButtonLink href={`/${lang}/checkout`} size="md" fullWidth className="mt-5">
              {dict.cart.proceed}
            </ButtonLink>
            <Link
              href={`/${lang}/attivita/roma`}
              className="mt-3 block text-center text-sm font-bold text-cta hover:underline"
            >
              {dict.cart.continue}
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}
