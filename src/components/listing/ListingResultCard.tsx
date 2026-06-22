import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/data/home";
import { type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * ISO language code → circular flag asset (`public/images/flags/*.svg`).
 * Mirrors the map in `home/ProductCard` (kept local so the listing card stays
 * independent of the shared home card). `en` → UK flag.
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

/**
 * Result card for the city listing — **horizontal** layout (image left, content
 * right), distinct from the home's vertical `ProductCard`. Pixel-perfect to Figma
 * node 64:5089: 119px image with the red "%" badge inset 16px; on the right a
 * SemiBold 12px CTA category + circular language flags, a Bold 16px title (max 3
 * lines), a SemiBold 10px dotted meta row, then a Bold 20px rating + star and the
 * "Da {old}€" struck price with a Bold 20px CTA price.
 */
export function ListingResultCard({
  product,
  lang,
  dict,
  onDark = false,
}: {
  product: Product;
  lang: Locale;
  dict: Dictionary;
  /** Su sfondo scuro (hero "Sei interessato a:") → niente bordo chiaro che fa da
   *  "traccia bianca" attorno alla card; resta solo l'hover cta. */
  onDark?: boolean;
}) {
  const href = product.slug
    ? `/${lang}/attivita/${product.city}/${product.slug}`
    : `/${lang}/attivita/${product.city}`;

  const languages = product.languages ?? [];
  const visibleLanguages = languages.slice(0, MAX_FLAGS);
  const extraLanguages = languages.length - visibleLanguages.length;
  const showRating = product.rating > 0;

  return (
    <Link
      href={href}
      className={`group flex items-stretch overflow-clip rounded-card bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta lg:flex-col ${
        onDark ? "" : "border border-soft hover:border-cta lg:border-stroke-2"
      }`}
    >
      <div className="relative w-[150px] shrink-0 self-stretch lg:aspect-[453/267] lg:w-full lg:self-auto">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(min-width: 1024px) 33vw, 150px"
          className="object-cover"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 whitespace-nowrap rounded-badge bg-badge px-2 py-1 text-sm font-extrabold leading-none text-white lg:left-4 lg:top-4 lg:text-base">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 px-4 py-2 lg:gap-4 lg:p-6">
        <div className="flex flex-col gap-2 lg:gap-3">
          <div className="flex items-center gap-2.5">
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-cta lg:text-base">
              {product.category}
            </span>
            {languages.length > 0 && (
              <div
                className="flex shrink-0 items-center gap-2"
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

          {product.urgency && (
            <Badge tone="ink" size="sm" className="self-start">
              {product.urgency}
            </Badge>
          )}

          <h3 className="line-clamp-3 text-base font-bold leading-tight text-ink transition-colors group-hover:text-cta lg:text-xl lg:font-extrabold">
            {product.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-2xs font-semibold text-ink lg:gap-x-2 lg:text-base">
            {product.meta.map((m, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="size-[5px] shrink-0 rounded-full bg-ink" />}
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
          {showRating ? (
            <span className="flex items-center gap-1 text-xl font-bold text-ink lg:text-xl lg:font-extrabold">
              {product.rating.toFixed(1)}
              <Image src="/images/icon-star.svg" alt="" width={21} height={21} className="lg:h-7 lg:w-7" />
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-end gap-1">
            {product.oldPrice && (
              <>
                <span className="text-[13px] text-ink lg:text-base">{dict.productCard.from}</span>{/* ds-guard-ignore-next-line: prezzo 13px mobile grandfathered (no token) */}
                <span className="text-[13px] text-ink line-through lg:text-base">
                  {product.oldPrice}
                  {product.currency}
                </span>
              </>
            )}
            {/* Desktop (Figma): prezzo scontato (con oldPrice) = rosso badge, prezzo
                pieno = blu cta. Mobile congelato → sempre cta. */}
            <span
              className={`text-xl font-bold leading-none text-cta lg:text-xl ${
                product.oldPrice ? "lg:text-badge" : ""
              }`}
            >
              {product.priceFrom}
              {product.currency}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
