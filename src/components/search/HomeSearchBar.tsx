"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useHydrated } from "@/lib/useHydrated";

import { SearchOverlay } from "@/components/search/SearchOverlay";
import { onOpenSearch } from "@/lib/search/searchSignal";
import type { Destination, Product } from "@/data/home";
import type { Attraction } from "@/data/listing";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  lang: Locale;
  dict: Dictionary;
  destinations: Destination[];
  attractions: Attraction[];
  products: Product[];
};

/**
 * Home hero search trigger. Looks like the Figma rounded pill (icon + placeholder,
 * no button) but is a single button. Tapping it opens the full-screen
 * {@link SearchOverlay}; the pill shares a `layoutId` with the overlay's search
 * field, so it smoothly flies up to the top while the overlay fades in.
 */
export function HomeSearchBar({ lang, dict, destinations, attractions, products }: Props) {
  const [open, setOpen] = useState(false);
  // Durante il morph-back (la pill che rivola in posizione, ~0.7s) blocchiamo ogni
  // interazione, coerente col lock d'apertura: niente tap finché l'animazione non finisce.
  const [closing, setClosing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const hydrated = useHydrated();

  // Allow opening from elsewhere (e.g. the empty cart's "explore" CTA).
  useEffect(() => onOpenSearch(() => setOpen(true)), []);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
    // reduced-motion → morph istantaneo, nessun blocco necessario.
    if (!reduceMotion) setClosing(true);
  };

  // Failsafe: se onLayoutAnimationComplete non scattasse, sblocca comunque entro
  // ~0.9s (poco oltre la durata del morph) così l'UI non resta mai congelata.
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setClosing(false), 900);
    return () => clearTimeout(t);
  }, [closing]);

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        layoutId="home-search-field"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={dict.search.homePlaceholder}
        animate={{ opacity: open ? 0 : 1 }}
        // Morph-back allineato al form (~0.7s); il fade resta breve.
        // reduced-motion → tutto istantaneo (niente morph), coerente col resto del sito.
        transition={
          reduceMotion
            ? { duration: 0 }
            : { layout: { type: "spring", duration: 0.7, bounce: 0.2 }, opacity: { duration: 0.3 } }
        }
        // Fine del morph-back (chiusura) → sblocca l'interazione.
        onLayoutAnimationComplete={() => setClosing(false)}
        style={{ pointerEvents: open ? "none" : "auto" }}
        className="flex h-11 w-full items-center gap-2.5 rounded-full border border-stroke bg-white px-4 text-left shadow-lg"
      >
        <Image
          src="/images/icon-search.svg"
          alt=""
          width={18}
          height={18}
          className="shrink-0"
          unoptimized
        />
        <span className="truncate text-base font-medium text-stroke">
          {dict.search.homePlaceholder}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <SearchOverlay
            key="search-overlay"
            lang={lang}
            dict={dict}
            destinations={destinations}
            attractions={attractions}
            products={products}
            onClose={close}
          />
        )}
      </AnimatePresence>

      {/* Interaction-lock di CHIUSURA: copre l'intero schermo e intercetta tap/click
          mentre la pill fa il morph-back → niente si tocca finché non è finita.
          (L'overlay è già smontato; questo gira sopra la home in portal.) */}
      {hydrated &&
        closing &&
        createPortal(
          <div aria-hidden className="fixed inset-0 z-[130] cursor-wait" />,
          document.body,
        )}
    </>
  );
}
