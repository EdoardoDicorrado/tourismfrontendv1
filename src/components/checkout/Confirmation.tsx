"use client";

import { useMemo, useSyncExternalStore } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { OrderItems } from "@/components/cart/OrderItems";
import { useHydrated } from "@/lib/useHydrated";
import { formatMoney } from "@/lib/format";
import type { CartItem } from "@/lib/cart/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface StoredOrder {
  reference: string;
  items: CartItem[];
  total: number;
}

const subscribeNoop = () => () => {};
function readStoredOrder(): string | null {
  try {
    return sessionStorage.getItem("tm_last_order");
  } catch {
    return null;
  }
}
const readStoredOrderServer = (): null => null;

/**
 * Order confirmation. Reads the just-placed order from sessionStorage (written by
 * the checkout submit). When the storefront API exists, this could instead fetch
 * the order from the backend by reference for a refresh-proof view.
 */
export function Confirmation({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const hydrated = useHydrated();
  const raw = useSyncExternalStore(subscribeNoop, readStoredOrder, readStoredOrderServer);

  const order = useMemo<StoredOrder | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredOrder;
      return parsed?.reference ? parsed : null;
    } catch {
      return null;
    }
  }, [raw]);

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-[640px]">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cta/10 text-cta">
            <CheckMark />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
            {dict.confirmation.title}
          </h1>
          <p className="mt-2 text-ink/70">{dict.confirmation.subtitle}</p>
        </div>

        {hydrated && order ? (
          <>
            <div className="mt-6 rounded-[15px] bg-soft p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-ink/60">
                {dict.confirmation.referenceLabel}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-cta">{order.reference}</p>
              <p className="mt-2 text-sm text-ink/70">{dict.confirmation.emailNote}</p>
            </div>

            <div className="mt-6 rounded-[15px] border border-soft-grey bg-white p-5 sm:p-6">
              <h2 className="text-lg font-extrabold text-ink">{dict.confirmation.summaryTitle}</h2>
              <div className="mt-3">
                <OrderItems items={order.items} lang={lang} dict={dict} compact />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-soft-grey pt-4 text-lg font-extrabold text-ink">
                <span>{dict.confirmation.total}</span>
                <span>{formatMoney(order.total, lang)}</span>
              </div>
            </div>
          </>
        ) : hydrated ? (
          <p className="mt-6 rounded-[15px] bg-soft p-5 text-center text-ink/70">
            {dict.confirmation.missing}
          </p>
        ) : (
          <div className="h-40" aria-hidden />
        )}

        <div className="mt-8 text-center">
          <ButtonLink href={`/${lang}`} size="md">
            {dict.confirmation.backHome}
          </ButtonLink>
          <p className="mt-4 text-sm text-ink/60">{dict.confirmation.supportNote}</p>
        </div>
      </div>
    </Container>
  );
}

function CheckMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
      <path
        d="M8 15.5l4.5 4.5L22 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
