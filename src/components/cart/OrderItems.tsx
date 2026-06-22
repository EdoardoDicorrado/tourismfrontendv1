"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { duration, ease, spring } from "@/lib/motion/tokens";
import { Button } from "@/components/ui/Button";
import { formatDateLong, formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CartItem } from "@/lib/cart/types";

function TrashIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7M6 7l1 12.5a2 2 0 0 0 2 1.9h6a2 2 0 0 0 2-1.9L18 7M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Read-only list of booked items, shared by the cart and checkout summary.
 * Pass `onRemove` to show a remove action (cart); omit it for a static summary.
 *
 * Removing asks for confirmation first via a centered modal overlay (portal to
 * `body` so the drawer's transform/overflow doesn't clip it). The modal handles
 * Esc / backdrop / scroll-lock / focus; its entrance animation is owned by
 * `animations` (kept static here on purpose).
 *
 * `compact` is the drawer look: each product sits in its own soft (azure) card
 * and shows a single title; the full-cart/summary look stays a divided list.
 */
export function OrderItems({
  items,
  lang,
  dict,
  onRemove,
  compact = false,
}: {
  items: CartItem[];
  lang: Locale;
  dict: Dictionary;
  onRemove?: (id: string) => void;
  compact?: boolean;
}) {
  const t = dict.cart;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Esc / backdrop close, body-scroll lock and focus while the confirm modal is
  // open. Same conventions as the other site modals (LoginModal/CartDrawer).
  useEffect(() => {
    if (pendingId === null) return;
    const prevFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (prevFocused instanceof HTMLElement) prevFocused.focus();
    };
  }, [pendingId]);

  return (
    <>
      {/* `relative`: ancora gli item in uscita di popLayout (position:absolute) al
          contenitore, così collassano sul posto invece di saltare via — senza,
          la rimozione sembrava non animata. */}
      <ul className={compact ? "relative flex flex-col gap-3" : "relative flex flex-col divide-y divide-soft-grey"}>
        {/* mode="popLayout": l'item rimosso esce dal flusso SUBITO (fade+shrink) e gli
            altri SALGONO con il layout spring per riempire il vuoto. initial={false}:
            niente entrata sugli item già presenti al primo render. */}
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => {
            const discounted = item.discountPercent > 0;
            // Pre-discount "from" price — `total` already has the discount applied.
            const original = discounted ? item.total / (1 - item.discountPercent / 100) : item.total;
            // Product page for this tour: tapping the image/title opens it; "Modifica"
            // lands on the booking box (#prenota) to change participants/date/slot.
            const productHref = `/${lang}/attivita/${item.city}/${item.slug}`;

            return (
              <motion.li
                key={item.id}
                layout
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.9, transition: { duration: duration.fast, ease: ease.entrance } }
                }
                transition={reduceMotion ? { duration: 0 } : { layout: spring }}
                className={
                  compact
                    ? "flex gap-4 rounded-card bg-soft p-3"
                    : "flex gap-4 py-4 first:pt-0 last:pb-0"
                }
              >
              {item.image && (
                <Link
                  href={productHref}
                  className={`relative shrink-0 overflow-hidden rounded-card ${
                    compact ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24"
                  }`}
                >
                  <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <Link
                  href={productHref}
                  className="font-bold leading-snug text-ink transition-colors hover:text-cta hover:underline"
                >
                  {item.title}
                </Link>
                {!compact && <p className="text-sm text-ink/70">{item.optionTitle}</p>}
                <p className="mt-1 text-sm text-ink/70">
                  {t.dateLabel}:{" "}
                  <span className="font-semibold text-ink">{formatDateLong(item.date, lang)}</span>
                  {"  ·  "}
                  {t.timeLabel}: <span className="font-semibold text-ink">{item.slot}</span>
                </p>
                <p className="mt-1 text-sm text-ink/60">
                  {item.lines.map((l) => `${l.qty} ${l.label}`).join("  ·  ")}
                </p>
                {/* Modifica → booking box, to change participants/date/slot. */}
                {onRemove && (
                  <Link
                    href={`${productHref}#prenota`}
                    className="mt-2 inline-block text-sm font-bold text-cta hover:underline"
                  >
                    {dict.checkout.edit}
                  </Link>
                )}
              </div>
              {/* Right column: price on top, trash (remove) pinned bottom-right to save
                  space. When discounted, the "from" price shrinks + strikes through and
                  the final price goes red at the same size as the non-discounted price. */}
              <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                <div className="text-right">
                  {discounted && (
                    <p className="text-xs text-ink/50 line-through">{formatMoney(original, lang)}</p>
                  )}
                  <p className={`font-extrabold ${discounted ? "text-badge" : "text-ink"}`}>
                    {formatMoney(item.total, lang)}
                  </p>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => setPendingId(item.id)}
                    aria-label={t.remove}
                    aria-haspopup="dialog"
                    className="flex size-11 items-center justify-center text-badge transition-opacity hover:opacity-70"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </motion.li>
          );
          })}
        </AnimatePresence>
      </ul>

      {typeof document !== "undefined" &&
        createPortal(
          // AnimatePresence persistente → la conferma entra (backdrop fade + dialog pop)
          // e ESCE in modo animato alla chiusura/conferma. reduced-motion → solo opacity.
          <AnimatePresence>
            {pendingId !== null && (
              <div
                key="remove-confirm"
                className="fixed inset-0 z-[var(--z-sheet)] flex items-center justify-center p-4"
              >
                <motion.button
                  type="button"
                  aria-label={t.cancel}
                  onClick={() => setPendingId(null)}
                  className="absolute inset-0 bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : duration.fast, ease: ease.entrance }}
                />
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="remove-confirm-title"
                  tabIndex={-1}
                  className="relative w-full max-w-[400px] rounded-panel bg-white p-6 text-center shadow-popover outline-none"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 8 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4 }}
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: duration.base, bounce: 0.3 }}
                >
              <h2 id="remove-confirm-title" className="text-xl font-extrabold text-ink">
                {t.removeConfirmTitle}
              </h2>
              <p className="mt-2 text-base text-ink/70">{t.removeConfirmBody}</p>
              <div className="mt-6 flex gap-3">
                <Button type="button" variant="outline" fullWidth onClick={() => setPendingId(null)}>
                  {t.cancel}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  fullWidth
                  onClick={() => {
                    onRemove?.(pendingId);
                    setPendingId(null);
                  }}
                >
                  {t.confirm}
                </Button>
              </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
