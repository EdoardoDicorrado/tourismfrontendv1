"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import type { BlogArticle, BlogCategory } from "@/data/blog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Esplora per categoria" — category pills that filter the article list, plus
 * the active category description. Figma nodes 447 (esplora per categoria).
 *
 * React Compiler is ON: `active` is only set from the pill onClick handler,
 * never from an effect.
 */
export function BlogCategories({
  lang,
  dict,
  categories,
  articles,
}: {
  lang: Locale;
  dict: Dictionary["blog"];
  categories: BlogCategory[];
  articles: BlogArticle[];
}) {
  const [active, setActive] = useState(categories[0]?.id ?? "");

  const current = categories.find((c) => c.id === active) ?? categories[0];
  const filtered = articles.filter((a) => a.categoryId === active);
  const labelFor = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <section className="bg-soft/40 py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.categoriesTitle}</h2>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              aria-pressed={active === c.id}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                active === c.id
                  ? "border-cta bg-cta text-white"
                  : "border-stroke text-ink hover:border-cta"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {current?.description && (
          <p className="mt-4 max-w-[640px] text-sm text-ink/70">{current.description}</p>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {filtered.length === 0 ? (
            <p className="rounded-[10px] bg-soft px-5 py-4 text-base font-medium text-ink/80">
              {dict.empty}
            </p>
          ) : (
            filtered.map((a) => (
              <Link
                key={a.slug}
                href={`/${lang}/blog/${a.slug}`}
                className="group flex gap-4 overflow-hidden rounded-[10px] bg-soft p-3 transition-shadow hover:shadow-md sm:p-4"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[8px] sm:h-24 sm:w-36">
                  <Image src={a.image} alt="" fill sizes="160px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cta">
                    {labelFor(a.categoryId)}
                  </p>
                  <h3 className="font-extrabold text-ink">{a.title}</h3>
                  <p className="line-clamp-1 text-xs text-ink/70">{a.excerpt}</p>
                  <span className="text-sm font-extrabold text-cta group-hover:underline">
                    {dict.readMore}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
