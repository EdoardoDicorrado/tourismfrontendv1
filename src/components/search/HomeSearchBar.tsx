"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { SearchOverlay } from "@/components/search/SearchOverlay";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

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
    </>
  );
}
