import Image from "next/image";

import type { ProductDetail } from "@/data/product";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const avatars = [
  "/images/avatar-review-1.png",
  "/images/avatar-review-2.png",
  "/images/avatar-review-3.png",
];

/** Product title block — tour count, title, rating and short description. Figma 64:9690. */
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

  return (
    <div className="flex flex-col gap-3">
      {showToursDone && (
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <Image src="/images/icon-walking.svg" alt="" width={22} height={22} />
            {fill(dict.product.toursDone, { count: product.toursCount })}
          </span>
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt=""
                width={20}
                height={20}
                className="rounded-full ring-2 ring-white"
              />
            ))}
          </div>
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
