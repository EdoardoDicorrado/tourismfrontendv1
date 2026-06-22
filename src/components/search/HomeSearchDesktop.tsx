"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

import { SearchResults } from "@/components/search/SearchResults";
import { onOpenSearch } from "@/lib/search/searchSignal";
import { useHydrated } from "@/lib/useHydrated";
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
 * Desktop (lg+) home search. The pill stays put — NO morph, NO full-screen overlay.
 * Focusing/typing opens a dropdown anchored under the bar showing the same content as
 * the mobile {@link SearchOverlay} (curated suggestions when empty, live results when
 * typing), via the shared {@link SearchResults}. Submitting hands off to `/[lang]/cerca`.
 *
 * The dropdown is portaled to <body> with `position: fixed` (re-measured on
 * scroll/resize) so the hero's `overflow-hidden` can't clip it.
 */
export function HomeSearchDesktop({ lang, dict, destinations, attractions, products }: Props) {
  const router = useRouter();
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Other parts of the app (e.g. empty cart "explore" CTA) can open search.
  useEffect(
    () =>
      onOpenSearch(() => {
        setOpen(true);
        inputRef.current?.focus();
      }),
    [],
  );

  // While open: position the portaled dropdown under the bar and close on outside
  // click / Esc. Posizione in coordinate DOCUMENTO (absolute + scrollY/scrollX) →
  // scorre nativamente col browser insieme alla barra, niente listener di scroll →
  // niente jitter/vibrazione. Si ricalcola solo all'apertura e su resize.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({
        top: r.bottom + window.scrollY + 8,
        left: r.left + window.scrollX,
        width: r.width,
      });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!containerRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  const goToResults = () => {
    setOpen(false);
    const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
    router.push(`/${lang}/cerca${q}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
        className="flex h-20 w-full items-center justify-between gap-6 rounded-full border border-stroke bg-white py-2 pl-6 pr-2 shadow-lg"
      >
        <span className="flex min-w-0 flex-1 items-center gap-6">
          <Image
            src="/images/icon-search.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 shrink-0"
            unoptimized
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={dict.search.homePlaceholder}
            aria-label={dict.search.homePlaceholder}
            className="w-full min-w-0 bg-transparent text-2xl font-medium text-ink outline-none placeholder:text-stroke"
          />
        </span>
        <button
          type="submit"
          className="flex h-full shrink-0 items-center rounded-full bg-cta px-6 text-2xl font-bold text-white transition-opacity hover:opacity-90"
        >
          {dict.search.button}
        </button>
      </form>

      {hydrated &&
        open &&
        rect &&
        createPortal(
          <motion.div
            ref={dropdownRef}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", top: rect.top, left: rect.left, width: rect.width }}
            className="z-[var(--z-dropdown)] rounded-sheet border border-stroke bg-white p-5 shadow-2xl"
          >
            <SearchResults
              lang={lang}
              dict={dict}
              query={query}
              destinations={destinations}
              attractions={attractions}
              products={products}
              onNavigate={() => setOpen(false)}
              compact
            />
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
