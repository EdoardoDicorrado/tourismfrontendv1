import Image from "next/image";

import type { ProductDetail } from "@/data/product";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * ISO language code → circular flag asset (`public/images/flags/*.svg`).
 * Mirrors the maps in `listing/ListingResultCard` and `home/ProductCard` so the
 * product header shows the same language flags as the cards. `en` → UK flag.
 */
const LANG_FLAG: Record<string, string> = {
  en: "/images/flags/gb.svg",
  it: "/images/flags/it.svg",
  es: "/images/flags/es.svg",
  fr: "/images/flags/fr.svg",
  de: "/images/flags/de.svg",
  pt: "/images/flags/pt.svg",
  ru: "/images/flags/ru.svg",
};

const MAX_FLAGS = 3;

/** Product title block — tour count, language flags, title, rating and short description. Figma 64:9690. */
export function ProductHeader({
  product,
  lang,
  dict,
}: {
  product: ProductDetail;
  lang: Locale;
  dict: Dictionary;
}) {
  // Decorative "tours done" social proof has no data source on real catalog
  // tours (empty toursCount) → hide the row. Show the rating only when there are
  // real approved reviews, so we never present a fake star average.
  const showToursDone = Boolean(product.toursCount);
  const showRating = product.reviews > 0;
  const languages = product.languages ?? [];
  const visibleLanguages = languages.slice(0, MAX_FLAGS);
  const extraLanguages = languages.length - visibleLanguages.length;

  return (
    <div className="flex flex-col gap-3">
      {(showToursDone || languages.length > 0) && (
        <div className="flex items-center gap-3">
          {showToursDone && (
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <Image src="/images/icon-walking-ink.svg" alt="" width={22} height={22} unoptimized />
              {fill(dict.product.toursDone, { count: product.toursCount })}
            </span>
          )}
          {languages.length > 0 && (
            <div
              className={`flex shrink-0 items-center gap-2.5${showToursDone ? " ml-auto" : ""}`}
              aria-label={languages.join(", ")}
            >
              {visibleLanguages.map((code) => {
                const flag = LANG_FLAG[code];
                return flag ? (
                  <Image
                    key={code}
                    src={flag}
                    alt=""
                    title={code.toUpperCase()}
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] rounded-full ring-1 ring-black/10"
                    unoptimized
                  />
                ) : (
                  <span
                    key={code}
                    title={code.toUpperCase()}
                    className="text-xs font-semibold text-ink"
                  >
                    {code.toUpperCase()}
                  </span>
                );
              })}
              {extraLanguages > 0 && (
                <span
                  title={languages.slice(MAX_FLAGS).join(", ").toUpperCase()}
                  className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-soft px-1 text-[10px] font-extrabold leading-none text-ink ring-1 ring-black/10"
                >
                  +{extraLanguages}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <h1 className="text-2xl font-extrabold leading-tight text-ink sm:text-3xl lg:text-4xl">
        {product.title}
      </h1>

      {showRating && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-ink">{product.rating.toFixed(1)}</span>
          <Image
            src="/images/rating-stars-large.svg"
            alt={fill(dict.common.ratingAlt, { rating: product.rating.toFixed(1) })}
            width={120}
            height={23}
          />
          <span className="text-sm text-cta">
            <strong className="font-bold">{product.reviews.toLocaleString(lang)}</strong>{" "}
            {dict.common.reviews}
          </span>
        </div>
      )}

      <p className="text-base text-ink/80">{product.shortDescription}</p>
    </div>
  );
}
