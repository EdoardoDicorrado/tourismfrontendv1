"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Popover } from "@/components/ui/Popover";
import { useToast } from "@/lib/toast/ToastContext";
import { useHydrated } from "@/lib/useHydrated";
import { formatDateLong } from "@/lib/format";
import type { CartItem } from "@/lib/cart/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface StoredOrder {
  reference: string;
  items: CartItem[];
  total: number;
  /** Lead booker — written by the checkout submit; used to attribute the referral answer. */
  customer?: { email?: string };
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
  const { toast } = useToast();
  const c = dict.confirmation;

  const order = useMemo<StoredOrder | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredOrder;
      return parsed?.reference ? parsed : null;
    } catch {
      return null;
    }
  }, [raw]);

  // "How did you find us?" survey. Optimistic: acknowledge locally, then POST the
  // answer to the referral BFF (preview-accepts until the storefront feedback API ships).
  const [referral, setReferral] = useState("");
  const [sent, setSent] = useState(false);
  function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!referral || sent) return;
    setSent(true);
    toast({ variant: "success", message: c.feedbackThanks, duration: 3000 });
    void fetch("/api/checkout/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: order?.reference,
        referral,
        email: order?.customer?.email,
        locale: lang,
      }),
    }).catch(() => {
      /* preview / network: the local "grazie" state already acknowledged it */
    });
  }

  const selectedReferral = c.referralOptions.find((o) => o.value === referral)?.label;

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-[640px]">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cta/10 text-cta">
            <CheckMark />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">{c.title}</h1>
          <p className="mt-2 text-ink/70">{c.subtitle}</p>
        </div>

        {hydrated && order ? (
          <>
            <div className="mt-6 rounded-panel bg-soft p-5 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-ink/60">
                {c.referenceLabel}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-cta">{order.reference}</p>
              <Link
                href={`/${lang}/area/prenotazioni`}
                className="mt-2 inline-block text-sm font-bold text-cta underline underline-offset-2"
              >
                {c.viewBooking}
              </Link>
              <p className="mt-2 text-sm text-ink/70">{c.emailNote}</p>
            </div>

            {/* Booking summary — title-less, Figma format (node 85:16877). */}
            <div className="mt-6 flex flex-col gap-4 rounded-panel bg-soft p-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex w-full gap-6">
                  {item.image && (
                    <span className="relative w-[108px] shrink-0 self-stretch overflow-hidden rounded-panel">
                      <Image src={item.image} alt="" fill sizes="108px" className="object-cover" />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="text-base font-bold leading-tight text-ink">{item.title}</p>
                    <p className="text-base text-ink">
                      {`${formatDateLong(item.date, lang)} · ${item.slot}`}
                    </p>
                    {item.features && item.features.length > 0 && (
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {item.features.map((f) => (
                          <li key={f} className="flex items-center gap-1.5 text-sm font-medium text-cta">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cta" aria-hidden />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* "Come ci hai trovato?" feedback (Figma node 85:16927). */}
            <form onSubmit={submitFeedback} className="mt-6 flex flex-col gap-3">
              <h2 className="text-base font-medium text-ink">{c.feedbackTitle}</h2>
              <Popover
                animated
                align="stretch"
                className="relative w-full"
                panelClassName="overflow-hidden rounded-xl border border-soft-grey bg-white text-ink shadow-popover"
                label={c.feedbackTitle}
                trigger={({ open, toggle, id }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    disabled={sent}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    aria-controls={id}
                    className={`flex w-full items-center justify-between gap-3 rounded-card border px-4 py-3 text-base transition-colors disabled:opacity-60 ${
                      open ? "border-cta" : "border-ink"
                    }`}
                  >
                    <span className={selectedReferral ? "font-medium text-ink" : "text-ink/40"}>
                      {selectedReferral ?? c.feedbackPlaceholder}
                    </span>
                    <Caret open={open} />
                  </button>
                )}
              >
                {({ close }) => (
                  <ul role="menu" className="max-h-64 overflow-y-auto py-1">
                    {c.referralOptions.map((o) => (
                      <li key={o.value} role="none">
                        <button
                          type="button"
                          role="menuitemradio"
                          aria-checked={o.value === referral}
                          onClick={() => {
                            setReferral(o.value);
                            close();
                          }}
                          className={`flex w-full px-4 py-2.5 text-left text-sm hover:bg-soft ${
                            o.value === referral ? "font-bold text-cta" : "font-medium text-ink"
                          }`}
                        >
                          {o.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Popover>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!referral || sent}
              >
                {sent ? c.feedbackSent : c.feedbackSubmit}
              </Button>
            </form>
          </>
        ) : hydrated ? (
          <p className="mt-6 rounded-panel bg-soft p-5 text-center text-ink/70">{c.missing}</p>
        ) : (
          <div className="h-40" aria-hidden />
        )}

        <div className="mt-8 text-center">
          <ButtonLink href={`/${lang}`} size="md">
            {c.backHome}
          </ButtonLink>
          <p className="mt-4 text-sm text-ink/60">{c.supportNote}</p>
        </div>
      </div>
    </Container>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden
      className={`shrink-0 text-ink/60 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M1 1.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
