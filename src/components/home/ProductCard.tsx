import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/data/home";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * ISO language code → circular flag asset (`public/images/flags/*.svg`), matching
 * Figma node 1:459 where the offered languages show as round flags. `en` → UK flag.
 * Codes without an asset fall back to the uppercased code (see render below).
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

/**
 * Single tour/offer card — links to the product detail, or the city listing as a fallback.
 * Geometry mirrors Figma node 1:459: 1px soft-blue border, 10px radius, 16px padding,
 * image at a 267×228 ratio with the badge inset 16px; category SemiBold 12px CTA,
 * title ExtraBold 16px, meta SemiBold 12px, rating ExtraBold 20px + 21px star,
 * price "Da 44€" SemiBold 12px struck-through and a Bold 20px badge-red price.
 */
export function ProductCard({
  product,
  lang,
  dict,
}: {
  product: Product;
  lang: Locale;
  dict: Dictionary;
}) {
  const href = product.slug
    ? `/${lang}/attivita/${product.city}/${product.slug}`
    : `/${lang}/attivita/${product.city}`;

  const languages = product.languages ?? [];
  // Mostriamo al massimo 3 bandiere; le altre lingue diventano un badge "+N".
  const MAX_FLAGS = 3;
  const visibleLanguages = languages.slice(0, MAX_FLAGS);
  const extraLanguages = languages.length - visibleLanguages.length;
  // Figma always shows the rating left of the price, so render it whenever a
  // value is present (the catalog adapter supplies the design's 4.7 fallback
  // until the backend seeds real review aggregates).
  const showRating = product.rating > 0;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-clip rounded-[10px] border border-soft bg-white transition-colors hover:border-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta lg:border-stroke-2"
    >
      <div className="relative aspect-[267/228] w-full">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 80vw, 25vw"
          className="object-cover"
        />
        <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
          {product.badge && <Badge tone="badge">{product.badge}</Badge>}
          {product.urgency && <Badge tone="ink">{product.urgency}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-3 lg:p-5">
        <div className="flex flex-col gap-2 lg:gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-cta lg:text-base">{product.category}</span>
            {languages.length > 0 ? (
              <div className="flex items-center gap-2" aria-label={languages.join(", ")}>
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
            ) : (
              <div className="flex -space-x-2">
                {product.avatars.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={18}
                    height={18}
                    className="rounded-full ring-2 ring-white"
                  />
                ))}
              </div>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-ink transition-colors group-hover:text-cta lg:text-xl">
            {product.title}
          </h3>

          <p className="text-xs font-semibold text-ink lg:text-base">{product.meta.join(" · ")}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          {showRating ? (
            <span className="flex items-center gap-1 text-xl font-extrabold text-ink lg:text-xl">
              <Image src="/images/icon-star.svg" alt="" width={21} height={21} className="lg:size-5" />
              {product.rating.toFixed(1)}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-end gap-1">
            {product.oldPrice && (
              <>
                <span className="text-xs font-semibold text-ink lg:text-base">{dict.productCard.from}</span>
                <span className="text-xs font-semibold text-ink line-through lg:text-base">
                  {product.oldPrice}
                  {product.currency}
                </span>
              </>
            )}
            <span className="text-xl font-bold leading-none text-badge lg:text-xl">
              {product.priceFrom}
              {product.currency}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
