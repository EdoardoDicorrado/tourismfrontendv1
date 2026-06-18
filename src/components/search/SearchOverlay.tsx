"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";

import type { Destination, Product } from "@/data/home";
import type { Attraction } from "@/data/listing";
import { ButtonLink } from "@/components/ui/Button";
import { fill } from "@/lib/i18n/config";
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
};

/** Tokenised AND match over a product's searchable fields — mirrors `/[lang]/cerca`. */
function matches(product: Product, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = [product.title, product.category, product.city, ...product.meta]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/** Product detail when a slug exists, otherwise the city listing (see ProductCard). */
function productHref(lang: Locale, p: Product): string {
  return p.slug ? `/${lang}/attivita/${p.city}/${p.slug}` : `/${lang}/attivita/${p.city}`;
}

/**
 * Full-screen search popup opened from the home hero. Mounted only while open, so
 * each open starts with an empty query. Empty state shows curated destinations +
 * attractions; typing filters the catalog live ("Tutto su: {q}"). Submitting (Enter)
 * or "Esplora tutte" hands off to the `/[lang]/cerca` results page.
 * Figma node 221:587 (empty) / 221:645 (typing).
 */
export function SearchOverlay({ lang, dict, destinations, attractions, products, onClose }: Props) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const reduceMotion = useReducedMotion();

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

  // Portal target (document.body) only exists after hydration.
  if (!hydrated) return null;

  const trimmed = query.trim();
  const terms = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  const results = trimmed ? products.filter((p) => matches(p, terms)) : [];

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
        transition={{ duration: reduceMotion ? 0 : 0.6 }}
      />

      {/* Search bar + close */}
      <div className="flex items-center gap-3 px-4 pb-2 pt-6 sm:gap-4 sm:px-6">
        <motion.form
          layoutId="home-search-field"
          // Morph spring a durata esplicita (~0.7s, bounce 0.2). Tienilo allineato
          // col morph-back della pill in HomeSearchBar.tsx. reduced-motion → istantaneo.
          transition={reduceMotion ? { duration: 0 } : { type: "spring", duration: 0.7, bounce: 0.2 }}
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
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.search.close}
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
        </button>
      </div>

      {/* Results / suggestions */}
      <motion.div
        className="mx-auto w-full max-w-[760px] flex-1 overflow-y-auto px-4 pb-12 pt-4 sm:px-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        // In apertura compare dopo il morph (delay 0.55); in chiusura sparisce subito (exit duration 0).
        // reduced-motion → appare subito senza delay.
        exit={{ opacity: 0, transition: { duration: 0 } }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.35, delay: 0.55 }}
      >
        {trimmed ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold text-ink">
              {fill(dict.search.allAbout, { q: trimmed })}
            </h2>
            {results.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <ResultCard
                      href={productHref(lang, p)}
                      image={p.image}
                      title={p.title}
                      badge={p.badge}
                      text={p.meta.join(" · ")}
                      onClose={onClose}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 flex flex-col items-center gap-4 rounded-[10px] border border-stroke-2 bg-white py-12 text-center">
                <h3 className="text-lg font-bold text-ink">
                  {fill(dict.search.noResultsTitle, { q: trimmed })}
                </h3>
                <p className="max-w-md text-sm text-ink/70">{dict.search.noResultsHint}</p>
                <ButtonLink
                  href={`/${lang}/attivita/roma`}
                  onClick={onClose}
                  size="sm"
                  className="px-6 py-3"
                >
                  {dict.search.exploreAll}
                </ButtonLink>
              </div>
            )}
          </section>
        ) : (
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-extrabold text-ink">{dict.search.suggestionsTitle}</h2>
              <ul className="flex flex-col gap-2">
                {destinations.map((d) => (
                  <li key={d.slug}>
                    <ResultCard
                      href={`/${lang}/attivita/${d.slug}`}
                      image={d.image}
                      title={d.name}
                      badge={d.badge}
                      text={d.description}
                      onClose={onClose}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-extrabold text-ink">{dict.search.attractionsTitle}</h2>
              <ul className="flex flex-col gap-2">
                {attractions.map((a) => (
                  <li key={a.slug}>
                    <ResultCard
                      href={`/${lang}/cerca?q=${encodeURIComponent(a.name)}`}
                      image={a.image}
                      eyebrow={a.city}
                      title={a.name}
                      text={a.description}
                      onClose={onClose}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

/** Horizontal media card used for every row in the popup (suggestions + results). */
function ResultCard({
  href,
  image,
  eyebrow,
  title,
  badge,
  text,
  onClose,
}: {
  href: string;
  image: string;
  eyebrow?: string;
  title: string;
  badge?: string;
  text?: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex min-h-[96px] items-stretch overflow-hidden rounded-[10px] border border-soft bg-white transition-colors hover:border-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta"
    >
      <div className="relative w-[120px] shrink-0 sm:w-[141px]">
        <Image src={image} alt="" fill sizes="141px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-4 py-2">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase text-cta">{eyebrow}</span>
        )}
        <h3 className="font-extrabold uppercase leading-tight text-ink sm:text-lg">{title}</h3>
        {badge && (
          <span className="inline-flex w-fit rounded-[5px] bg-badge px-2 py-1 text-xs font-extrabold text-white">
            {badge}
          </span>
        )}
        {text && <p className="line-clamp-2 text-xs leading-snug text-ink/80">{text}</p>}
      </div>
    </Link>
  );
}
