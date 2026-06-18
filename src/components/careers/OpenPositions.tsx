"use client";

import Image from "next/image";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Posizioni aperte" — a client-side searchable list of open roles plus the
 * LinkedIn note. Figma nodes 447:1489 / 447:1462 (search). Positions are static
 * dictionary data for now (no careers API yet); the search filters them in the
 * browser. Each card links to the application intro (`#candidatura`).
 *
 * React Compiler is ON — `query` is only ever set from the input's onChange
 * handler, never from an effect.
 */
export function OpenPositions({ dict }: { dict: Dictionary["careers"] }) {
  const t = dict.positions;
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? t.items.filter((p) =>
        [p.title, p.category, p.location].some((field) => field.toLowerCase().includes(q)),
      )
    : t.items;

  const hasPositions = t.items.length > 0;

  return (
    <section className="bg-soft/40 py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>

        {hasPositions && (
          <div className="mt-6 max-w-[520px]">
            <label htmlFor="careers-search" className="sr-only">
              {dict.search.label}
            </label>
            <div className="flex items-center gap-3 rounded-full border border-stroke bg-white px-5 py-3">
              <Image
                src="/images/icon-search.svg"
                alt=""
                width={20}
                height={20}
                className="shrink-0"
              />
              <input
                id="careers-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.search.placeholder}
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-stroke"
              />
            </div>
          </div>
        )}

        <div className="mt-8">
          {!hasPositions ? (
            <p className="rounded-[10px] bg-soft px-5 py-4 text-base font-medium text-ink/80">
              {t.empty}
            </p>
          ) : filtered.length === 0 ? (
            <p className="rounded-[10px] bg-soft px-5 py-4 text-base font-medium text-ink/80">
              {t.noResults}
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((position) => (
                <li
                  key={position.id}
                  className="flex flex-col gap-3 rounded-[10px] bg-soft p-5 transition-shadow hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-cta">
                    {position.category}
                  </p>
                  <p className="text-base font-extrabold text-ink">{position.title}</p>
                  <p className="text-xs font-medium text-ink/70">{position.location}</p>
                  <a
                    href="#candidatura"
                    className="mt-1 text-base font-extrabold text-cta hover:underline"
                  >
                    {t.apply}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 max-w-[760px]">
          <p className="text-base font-extrabold text-ink">{t.linkedinTitle}</p>
          <p className="mt-2 text-base text-ink/90">
            {t.linkedinBefore}
            <a
              href={t.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-ink underline hover:text-cta"
            >
              {t.linkedinLabel}
            </a>
            {t.linkedinAfter}
          </p>
        </div>
      </Container>
    </section>
  );
}
