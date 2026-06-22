"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Careers search — its own section right under the hero (Figma 447:1462). A pill
 * input that, on focus/typing, shows a dropdown of the open positions filtered
 * live; picking one scrolls to its card (`#position-<id>`) in "Posizioni aperte".
 */
export function CareersSearch({ dict }: { dict: Dictionary["careers"] }) {
  const positions = dict.positions.items;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? positions.filter((p) =>
        [p.title, p.category, p.location].some((field) => field.toLowerCase().includes(q)),
      )
    : positions;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goTo = (id: string) => {
    setOpen(false);
    setQuery("");
    const el = document.getElementById(`position-${id}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className="py-4 lg:py-8">
      <Container>
        <div ref={boxRef} className="relative">
          <label htmlFor="careers-search" className="sr-only">
            {dict.search.label}
          </label>
          <div className="flex h-11 items-center gap-2.5 rounded-full border border-stroke bg-white px-[17px] lg:h-16 lg:gap-4 lg:pl-7 lg:pr-2">{/* ds-guard-ignore: pill px-17 grandfathered (mobile) */}
            <Image src="/images/icon-search.svg" alt="" width={18} height={18} className="shrink-0 lg:size-6" />
            <input
              id="careers-search"
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={open}
              aria-controls="careers-search-list"
              autoComplete="off"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder={dict.search.placeholder}
              className="w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-stroke lg:text-lg"
            />
            {/* Bottone "Cerca": solo desktop (Figma 605:1035). La ricerca è live, qui
                apre/focalizza il campo. i18n preview "Cerca" → task marketing. */}
            <button
              type="button"
              onClick={() => {
                setOpen(true);
                inputRef.current?.focus();
              }}
              className="hidden shrink-0 rounded-full bg-cta px-7 py-3 text-base font-extrabold text-white transition-colors hover:bg-cta-hover active:bg-cta-active lg:inline-flex lg:items-center"
            >
              Cerca
            </button>
          </div>

          {open && positions.length > 0 && (
            <ul
              id="careers-search-list"
              role="listbox"
              className="absolute inset-x-0 top-[calc(100%+8px)] z-20 max-h-72 overflow-auto rounded-card border border-stroke bg-white py-1 shadow-popover"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm font-medium text-ink/60">
                  {dict.positions.noResults}
                </li>
              ) : (
                filtered.map((p) => (
                  <li key={p.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => goTo(p.id)}
                      className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-soft"
                    >
                      <span className="text-sm font-extrabold text-ink">{p.title}</span>
                      <span className="text-xs font-medium text-ink/60">
                        {p.category} · {p.location}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}
