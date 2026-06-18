"use client";

import Image from "next/image";
import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/home/ProductCard";
import type { Product } from "@/data/home";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const PAGE = 6;

/** Tour result grid with progressive "Mostra altro" reveal. Driven by the active filters. Figma 221:4132. */
export function ResultsGrid({
  lang,
  dict,
  products,
  count,
  hasFilters,
  onClear,
}: {
  lang: Locale;
  dict: Dictionary;
  products: Product[];
  count: number;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const [visible, setVisible] = useState(PAGE);
  const shown = products.slice(0, visible);
  const hasMore = visible < products.length;

  return (
    <section className="py-8 sm:py-10">
      <Container>
        <div className="flex items-center gap-2">
          <Image src="/images/icon-info-circle.svg" alt="" width={24} height={24} />
          <h2 className="text-lg font-semibold text-cta sm:text-xl">
            {fill(dict.results.found, { count: count.toLocaleString(lang) })}
          </h2>
        </div>

        {products.length > 0 ? (
          <>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} dict={dict} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="rounded-[10px] border border-cta px-6 py-3 text-sm font-extrabold text-cta transition-colors hover:bg-cta hover:text-white"
                >
                  {dict.results.showMore}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-[10px] border border-dashed border-stroke bg-soft/40 py-14 text-center">
            <p className="max-w-md text-sm text-ink/70">{dict.results.none}</p>
            {hasFilters && (
              <Button type="button" onClick={onClear} size="sm">
                {dict.results.clear}
              </Button>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
