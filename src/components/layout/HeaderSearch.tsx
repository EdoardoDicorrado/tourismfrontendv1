"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";

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
 * Header search trigger for INTERNAL pages (Figma internal header: logo + globe +
 * search + cart + user). Tapping the magnifier opens the existing animated
 * {@link SearchOverlay} (the "pop"). Hidden on the homepage, where the hero already
 * shows the big search pill. The motion lives entirely in SearchOverlay (owned by
 * animations-1) — this component only toggles it open/closed.
 */
export function HeaderSearch({ lang, dict, destinations, attractions, products }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Homepage = hero pill handles search → no duplicate trigger in the header.
  if (pathname === `/${lang}`) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={dict.search.button}
        className="flex h-11 w-11 items-center justify-center text-cta"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="10.5" cy="10.5" r="7.5" stroke="currentColor" strokeWidth="2.2" />
          <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <SearchOverlay
            key="header-search-overlay"
            variant="header"
            lang={lang}
            dict={dict}
            destinations={destinations}
            attractions={attractions}
            products={products}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
