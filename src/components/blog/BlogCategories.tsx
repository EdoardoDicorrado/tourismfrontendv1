"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Popover } from "@/components/ui/Popover";
import type { BlogArticle, BlogCategory } from "@/data/blog";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Placeholder sub-topics (da correggere) — servono solo a far funzionare il dropdown. */
const TOPICS = ["Viaggi", "Tour"];

/** Caret che si gira all'apertura (come la pagina recensioni). */
function CaretDown({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="10"
      viewBox="0 0 18 10"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M1 1l8 8 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 text-cta">
      <path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * "Esplora per categoria" — Figma "Blog // Mobile" (447:2413). Category pills on a
 * SINGLE scrollable row (like the listing filters), then the active category's
 * title + a topic dropdown, its description, "{n} Articoli trovati" + "Vedi tutti",
 * the category's articles as horizontal cards, and a full-width "Prenota ora {city}".
 *
 * React Compiler is ON: `active` is only set from the pill onClick handler.
 */
export function BlogCategories({
  lang,
  dict,
  categories,
  articles,
  bookCity,
  bookCitySlug,
}: {
  lang: Locale;
  dict: Dictionary["blog"];
  categories: BlogCategory[];
  articles: BlogArticle[];
  bookCity: string;
  bookCitySlug: string;
}) {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [topic, setTopic] = useState<string | null>(null);

  const current = categories.find((c) => c.id === active) ?? categories[0];
  const filtered = articles.filter((a) => a.categoryId === active);
  const labelFor = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <section className="pb-12">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink">{dict.categoriesTitle}</h2>
      </Container>

      {/* Pills su UNA riga, scroll orizzontale (come i filtri del listing). Full-bleed. */}
      <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            aria-pressed={active === c.id}
            className={`shrink-0 whitespace-nowrap rounded-card px-4 py-3.5 text-base font-semibold transition-colors ${
              active === c.id ? "bg-cta text-white" : "bg-soft text-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <Container className="mt-6 flex flex-col gap-4">
        {/* Titolo categoria + dropdown "Argomento" */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-extrabold text-ink">{current?.label}</h3>
          {/* Dropdown "Argomento" FUNZIONANTE (stile pagina recensioni: Popover + listbox).
              Voci placeholder (Viaggi/Tour) — da correggere; per ora non filtra. */}
          <Popover
            animated
            align="end"
            className="relative shrink-0"
            panelClassName="w-[182px] overflow-hidden rounded-card border border-stroke-2 bg-white p-1 text-ink shadow-popover"
            trigger={({ open, toggle, id }) => (
              <button
                type="button"
                onClick={toggle}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={id}
                className="flex h-11 w-[182px] items-center justify-between gap-2 rounded-card border border-cta p-2 text-sm font-extrabold text-ink"
              >
                <span className="truncate">{topic ?? dict.topic}</span>
                <CaretDown open={open} />
              </button>
            )}
          >
            {({ close }) => (
              <ul role="listbox" aria-label={dict.topic} className="flex flex-col">
                {TOPICS.map((tpc) => {
                  const sel = tpc === topic;
                  return (
                    <li key={tpc}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={sel}
                        onClick={() => {
                          setTopic(tpc);
                          close();
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-card px-3 py-2.5 text-left text-sm transition-colors ${
                          sel ? "bg-soft font-extrabold text-cta" : "font-semibold text-ink hover:bg-soft/60"
                        }`}
                      >
                        {tpc}
                        {sel && <Check />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Popover>
        </div>

        {/* Descrizione categoria */}
        {current?.description && <p className="text-sm text-ink">{current.description}</p>}

        {/* {n} Articoli trovati + Vedi tutti */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-cta">
            {fill(dict.articlesFound, { count: String(filtered.length) })}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="7.5" r="1" fill="currentColor" />
            </svg>
          </span>
          <Link href={`/${lang}/blog`} className="text-base font-extrabold text-cta hover:underline">
            {dict.viewAll}
          </Link>
        </div>

        {/* Articoli della categoria — card ORIZZONTALI (immagine sx + contenuto soft) */}
        {filtered.length === 0 ? (
          <p className="rounded-card bg-soft px-5 py-4 text-base font-medium text-ink/80">{dict.empty}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((a) => (
              <Link
                key={a.slug}
                href={`/${lang}/blog/${a.slug}`}
                className="group flex h-[124px] items-stretch overflow-hidden rounded-card"
              >
                <span className="relative w-[101px] shrink-0 overflow-hidden bg-soft">
                  <Image src={a.image} alt="" fill sizes="101px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col justify-center gap-2 bg-soft p-4">
                  <span className="text-xs font-semibold uppercase text-cta">{labelFor(a.categoryId)}</span>
                  <span className="line-clamp-1 text-base font-extrabold leading-tight text-ink">{a.title}</span>
                  <span className="line-clamp-1 text-xs font-medium text-ink/80">{a.excerpt}</span>
                  <span className="text-base font-extrabold text-cta group-hover:underline">
                    {dict.readMore}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Prenota ora {city} — full-width, in fondo alla sezione (Figma). */}
        <ButtonLink href={`/${lang}/attivita/${bookCitySlug}`} size="lg" fullWidth className="mt-2">
          {fill(dict.book, { city: bookCity })}
        </ButtonLink>
      </Container>
    </section>
  );
}
