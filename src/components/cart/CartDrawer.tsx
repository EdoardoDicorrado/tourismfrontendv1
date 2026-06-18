"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { ButtonLink } from "@/components/ui/Button";
import { OrderItems } from "@/components/cart/OrderItems";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Slide-in cart drawer (right edge), mounted once in the layout. Open/close state
 * lives in CartContext so the header cart button toggles it from anywhere. Stays
 * mounted while closed so the transform transition can animate both ways.
 */
export function CartDrawer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { items, hydrated, total, removeItem, open, closeCart } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // While open: lock body scroll, close on Esc, focus the close button, and
  // restore focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const prevFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      if (prevFocused instanceof HTMLElement) prevFocused.focus();
    };
  }, [open, closeCart]);

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`} inert={!open}>
      {/* Backdrop */}
      <motion.button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label={dict.cart.close}
        onClick={closeCart}
        className="absolute inset-0 bg-black/40"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      />

      {/* Panel — move-in/move-out da destra (x 0%↔100%), largo 3/4 della pagina
          (lascia 1/4 di backdrop). Tween con curva da drawer per una slide netta.
          Reduced-motion → snap istantaneo. */}
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        className="absolute right-0 top-0 flex h-full w-[90%] max-w-[520px] flex-col bg-white shadow-2xl"
        initial={false}
        animate={{ x: open ? "0%" : "100%" }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        <header className="flex items-center justify-between border-b border-soft-grey px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink">
            {dict.cart.title}
            {hydrated && items.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cta px-1.5 text-xs font-bold text-white">
                {items.length}
              </span>
            )}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label={dict.cart.close}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-soft"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {!hydrated ? (
          <div className="flex-1" aria-hidden />
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-ink/70">{dict.cart.empty}</p>
            <ButtonLink href={`/${lang}/attivita/roma`} onClick={closeCart} size="md">
              {dict.cart.emptyCta}
            </ButtonLink>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <OrderItems items={items} lang={lang} dict={dict} onRemove={removeItem} compact />
            </div>

            <footer className="border-t border-soft-grey px-5 py-4">
              <div className="flex items-center justify-between text-lg font-extrabold text-ink">
                <span>{dict.cart.total}</span>
                <span>{formatMoney(total, lang)}</span>
              </div>
              <ButtonLink href={`/${lang}/checkout`} onClick={closeCart} size="md" fullWidth className="mt-4">
                {dict.cart.proceed}
              </ButtonLink>
              <div className="mt-3 flex items-center justify-between text-sm font-bold">
                <Link href={`/${lang}/carrello`} onClick={closeCart} className="text-cta hover:underline">
                  {dict.cart.viewFull}
                </Link>
                <button type="button" onClick={closeCart} className="text-ink/70 hover:text-ink">
                  {dict.cart.continue}
                </button>
              </div>
            </footer>
          </>
        )}
      </motion.aside>
    </div>
  );
}
