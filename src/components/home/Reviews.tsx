import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ReviewsInfoTooltip } from "@/components/home/ReviewsInfoTooltip";
import { Stars } from "@/components/ui/Stars";
import { reviews as defaultReviews, reviewsSummary, type Review } from "@/data/home";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Cosa pensano i nostri viaggiatori" — Google-style reviews. Figma node 1:582.
 *
 * Mobile: horizontal scroll-snap slider of 267px review cards (the next peeks).
 * sm+: static 3-column grid. Each card mirrors Figma 1:595 — soft-blue fill,
 * 10px radius, 16px padding; a 5-star row + Chrome glyph, a 44px avatar with the
 * author (ExtraBold 16px) and tour (SemiBold 12px CTA), the review body
 * (Medium 12px) and a "Leggi la recensione" link (ExtraBold 16px CTA).
 */
export function Reviews({
  lang,
  dict,
  title,
  cta,
  reviews = defaultReviews,
}: {
  lang: Locale;
  dict: Dictionary;
  title?: string;
  cta?: string;
  /** Which reviews to show, in order (sourced via `getHomeReviews`). Defaults to fixtures. */
  reviews?: Review[];
}) {
  return (
    <section className="py-4 sm:py-12">
      <Container>
        {/* Info "i" sits to the RIGHT of the heading as a click tooltip
            (intentional divergence from Figma 1:1184, which has it on the left). */}
        <div className="flex items-start gap-3">
          <h2 className="flex-1 text-2xl font-extrabold text-ink">{title ?? dict.reviews.title}</h2>
          <ReviewsInfoTooltip label={dict.reviews.infoLabel} text={dict.reviews.infoTooltip} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <span className="text-2xl font-extrabold text-ink">
            {reviewsSummary.rating.toFixed(1)}
          </span>
          <Image
            src="/images/rating-stars-large.svg"
            alt={fill(dict.common.ratingAlt, { rating: reviewsSummary.rating.toFixed(1) })}
            width={156}
            height={31}
          />
          <span className="text-sm font-medium text-cta">
            {dict.common.basedOn}{" "}
            <strong className="font-bold">
              {reviewsSummary.count.toLocaleString(lang)}
            </strong>{" "}
            {dict.common.reviews}
          </span>
        </div>

        <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.id} className="w-[267px] shrink-0 snap-start sm:w-auto">
              <article className="flex h-full flex-col gap-4 rounded-[10px] bg-soft p-4">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} size={14} />
                  {/* Reviews are sourced from Google → use the Google "G" mark. */}
                  <Image src="/images/icon-google.svg" alt="Google" width={16} height={16} />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/avatar-review-default.svg"
                      alt=""
                      width={44}
                      height={44}
                      className="shrink-0 rounded-full"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="truncate text-base font-extrabold text-ink">{r.author}</p>
                      <p className="truncate text-xs font-medium text-ink/60">{r.date}</p>
                      <p className="truncate text-xs font-semibold text-cta">{r.tour}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="line-clamp-3 text-xs font-medium leading-[1.3] text-ink">
                      {r.text}
                    </p>
                    <Link
                      href={`/${lang}/recensioni`}
                      className="self-start text-xs font-semibold text-cta underline underline-offset-2 hover:text-cta/80"
                    >
                      {dict.reviews.readReview}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>

        {cta ? (
          <div className="mt-6">
            <ButtonLink href={`/${lang}/recensioni`} size="md" fullWidth>
              {cta}
            </ButtonLink>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
