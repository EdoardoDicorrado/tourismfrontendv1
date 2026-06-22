"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

import type { Destination, Product } from "@/data/home";
import type { Attraction } from "@/data/listing";
import { SearchResults } from "@/components/search/SearchResults";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useHydrated } from "@/lib/useHydrated";

type Props = {
  lang: Locale;
  dict: Dictionary;
  destinations: Destination[];
  attractions: Attraction[];
  /** Searchable catalog, filtered client-side as the user types. */
  products: Product[];
  onClose: () => void;
  /**
   * Motion preset for the entrance:
   * - `"hero"` (default): morph dalla pill della home (`layoutId`, spring ~0.7s).
   * - `"header"`: aperto dall'header interno (nessuna pill sorgente) → entrata
   *   più veloce, dura ~0.5s (niente morph), backdrop/lista accelerati.
   */
  variant?: "hero" | "header";
};

/**
 * Full-screen search popup opened from the home hero. Mounted only while open, so
 * each open starts with an empty query. Empty state shows curated destinations +
 * attractions; typing filters the catalog live ("Tutto su: {q}"). Submitting (Enter)
 * or "Esplora tutte" hands off to the `/[lang]/cerca` results page.
 * Figma node 221:587 (empty) / 221:645 (typing).
 */
export function SearchOverlay({
  lang,
  dict,
  destinations,
  attractions,
  products,
  onClose,
  variant = "hero",
}: Props) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();
  // Aperto dall'header interno: nessuna pill condivide il layoutId → niente morph,
  // entrata propria più rapida (~0.5s) invece dello spring 0.7s della home.
  const isHeader = variant === "header";
  // Mentre il morph d'apertura (searchbar → overlay) è in corso blocchiamo OGNI
  // interazione: l'utente non può toccare nulla finché l'animazione non è finita.
  // reduced-motion = nessun morph → parte già "done" (nessun blocco).
  const [morphDone, setMorphDone] = useState(Boolean(reduceMotion));

  // Lock body scroll, close on Esc and focus the input while mounted; the cleanup
  // restores scroll on close (unmount).
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Failsafe: se onLayoutAnimationComplete non scattasse, sblocchiamo comunque
  // entro 1s così l'interfaccia non resta mai congelata.
  useEffect(() => {
    if (morphDone) return;
    const t = setTimeout(() => setMorphDone(true), 1000);
    return () => clearTimeout(t);
  }, [morphDone]);

  // Portal target (document.body) only exists after hydration.
  if (!hydrated) return null;

  const trimmed = query.trim();

  const goToResults = () => {
    onClose();
    const q = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    router.push(`/${lang}/cerca${q}`);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.search.button}
      className="fixed inset-0 z-[120] flex flex-col"
    >
      {/* White backdrop fades IN over 0.6s, ma in chiusura sparisce ISTANTANEAMENTE
          (exit duration 0): l'hero riappare subito mentre solo la barra fa il morph-back. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0 } }}
        transition={{ duration: reduceMotion ? 0 : isHeader ? 0.3 : 0.6 }}
      />

      {/* Search bar + close */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6 sm:gap-4 sm:px-6">
        <motion.form
          // hero → morph condiviso con la pill della home (layoutId). header → niente
          // morph (nessuna pill sorgente): entrata propria fade+slide in 0.5s.
          layoutId={isHeader ? undefined : "home-search-field"}
          initial={isHeader && !reduceMotion ? { opacity: 0, y: -12 } : undefined}
          animate={isHeader && !reduceMotion ? { opacity: 1, y: 0 } : undefined}
          // hero: morph spring ~0.7s (allineato al morph-back della pill in
          // HomeSearchBar.tsx). header: entrata 0.5s easeOut. reduced-motion → istantaneo.
          transition={
            reduceMotion
              ? { duration: 0 }
              : isHeader
                ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                : { type: "spring", duration: 0.7, bounce: 0.2 }
          }
          // Sblocco dell'interaction-lock: hero alla fine del morph (layout),
          // header alla fine dell'entrata (animate opacity/y, ~0.5s).
          onLayoutAnimationComplete={isHeader ? undefined : () => setMorphDone(true)}
          onAnimationComplete={isHeader ? () => setMorphDone(true) : undefined}
          onSubmit={(e) => {
            e.preventDefault();
            goToResults();
          }}
          className="flex h-11 flex-1 items-center gap-2.5 rounded-full border border-stroke bg-white px-4 shadow-lg"
        >
          <Image
            src="/images/icon-search.svg"
            alt=""
            width={18}
            height={18}
            className="shrink-0"
            unoptimized
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.search.homePlaceholder}
            aria-label={dict.search.homePlaceholder}
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-stroke"
          />
        </motion.form>
        <motion.button
          type="button"
          onClick={onClose}
          aria-label={dict.search.close}
          // In chiusura l'overlay resta montato ~0.7s per il morph-back della pill
          // (layoutId condiviso). Senza exit il close button resterebbe l'unico
          // residuo visibile: lo facciamo sparire ISTANTANEAMENTE come backdrop/lista.
          exit={{ opacity: 0, transition: { duration: 0 } }}
          className="shrink-0 text-cta transition-opacity hover:opacity-70"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M9.5 9.5l5 5M14.5 9.5l-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>
      </div>

      {/* Results / suggestions */}
      <motion.div
        className="mx-auto w-full max-w-[760px] flex-1 overflow-y-auto px-4 pb-12 pt-4 sm:px-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        // In apertura compare dopo l'entrata (hero: delay 0.55 dopo il morph; header:
        // delay 0.15, più rapido per stare nei ~0.5s); in chiusura sparisce subito.
        // reduced-motion → appare subito senza delay.
        exit={{ opacity: 0, transition: { duration: 0 } }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : isHeader
              ? { duration: 0.3, delay: 0.15 }
              : { duration: 0.35, delay: 0.55 }
        }
      >
        <SearchResults
          lang={lang}
          dict={dict}
          query={query}
          destinations={destinations}
          attractions={attractions}
          products={products}
          onNavigate={onClose}
        />
      </motion.div>

      {/* Interaction-lock: copre l'intero schermo e intercetta tap/click finché il
          morph d'apertura non è finito → durante l'animazione non si tocca nulla. */}
      {!morphDone && <div aria-hidden className="absolute inset-0 z-[130] cursor-wait" />}
    </div>,
    document.body,
  );
}
