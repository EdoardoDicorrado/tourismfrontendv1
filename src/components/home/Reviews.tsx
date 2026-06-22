import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { CardSlider } from "@/components/ui/CardSlider";
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
  slider = false,
  loopTo,
  cols = 3,
}: {
  lang: Locale;
  dict: Dictionary;
  title?: string;
  cta?: string;
  /** Which reviews to show, in order (sourced via `getHomeReviews`). Defaults to fixtures. */
  reviews?: Review[];
  /**
   * Render as a horizontal slider with the home "next" arrow (visible on desktop
   * too), instead of the static sm/lg grid. Used on the homepage.
   */
  slider?: boolean;
  /** Repeat `reviews` (cycling) up to this many cards — e.g. 9 looped from 3 fixtures. */
  loopTo?: number;
  /** Card visibili per vista nello slider desktop: home=3, scheda prodotto=2 (Figma). */
  cols?: 2 | 3;
}) {
  // Loop the fixtures up to `loopTo` so the slider can show more than the 3 we
  // have (Edoardo: homepage mostra 9 a loop). Keys disambiguate the repeats.
  const items =
    loopTo && reviews.length > 0
      ? Array.from({ length: loopTo }, (_, i) => reviews[i % reviews.length])
      : reviews;

  const renderCardBody = (r: Review) => (
    <article className="flex h-full flex-col gap-4 rounded-card bg-soft p-4 lg:gap-4 lg:p-5">
      <div className="flex items-center justify-between">
        <Stars value={r.rating} size={14} />
        {/* Reviews are sourced from Google → use the Google "G" mark. */}
        <Image src="/images/icon-google.svg" alt="Google" width={16} height={16} className="lg:size-6" />
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
            <p className="truncate text-base font-extrabold text-ink lg:text-base">{r.author}</p>
            <p className="truncate text-xs font-medium text-ink/60 lg:text-base">{r.date}</p>
            <p className="truncate text-xs font-semibold text-cta lg:text-base">{r.tour}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="line-clamp-3 text-xs font-medium leading-[1.3] text-ink lg:text-base">
            {r.text}
          </p>
          <Link
            href={`/${lang}/recensioni`}
            className="self-start text-xs font-semibold text-cta underline underline-offset-2 hover:text-cta/80 lg:text-base"
          >
            {dict.reviews.readReview}
          </Link>
        </div>
      </div>
    </article>
  );

  return (
    <section className="py-4 sm:py-12 lg:py-6">
      <Container>
        {/* Info "i" sits to the RIGHT of the heading as a click tooltip
            (intentional divergence from Figma 1:1184, which has it on the left).
            NB: niente flex-row-reverse — su desktop spostava l'icona a SINISTRA. */}
        <div className="flex items-start gap-3 lg:items-center lg:gap-6">
          <h2 className="flex-1 text-2xl font-extrabold text-ink lg:text-3xl lg:font-bold">{title ?? dict.reviews.title}</h2>
          <ReviewsInfoTooltip label={dict.reviews.infoLabel} text={dict.reviews.infoTooltip} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 lg:mt-6 lg:gap-10">
          <span className="text-2xl font-extrabold text-ink lg:text-4xl">
            {reviewsSummary.rating.toFixed(1)}
          </span>
          <Image
            src="/images/rating-stars-large.svg"
            alt={fill(dict.common.ratingAlt, { rating: reviewsSummary.rating.toFixed(1) })}
            width={156}
            height={31}
            className="lg:h-9 lg:w-auto"
          />
          <span className="text-sm font-medium text-cta lg:text-base">
            {dict.common.basedOn}{" "}
            <strong className="font-bold">
              {reviewsSummary.count.toLocaleString(lang)}
            </strong>{" "}
            {dict.common.reviews}
          </span>
        </div>

        {slider ? (
          // Homepage: slider con la freccia "next" della home (anche su desktop),
          // NON la griglia statica. Mobile congelato: stesse classi base, cambia
          // solo sm/lg (resta slider invece di grid). Card desktop 3-up via calc.
          <CardSlider
            label={dict.common.nextCard}
            desktopArrow
            className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:scroll-px-0 sm:pb-0 lg:gap-10"
          >
            {/* cols=2 (scheda prodotto): 2 card/vista = (100% - 1 gap 2.5rem)/2.
                cols=3 (home): 3/vista = (100% - 2 gap)/3. gap desktop = lg:gap-10 (2.5rem). */}
            {items.map((r, i) => (
              <li key={`${r.id}-${i}`} className={`w-[267px] shrink-0 snap-start ${cols === 2 ? "lg:w-[calc((100%_-_2.5rem)/2)]" : "lg:w-[calc((100%_-_5rem)/3)]"}`}>{/* ds-guard-ignore: card recensione 267px + larghezza slider N-up calc responsive */}
                {renderCardBody(r)}
              </li>
            ))}
          </CardSlider>
        ) : (
          <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-10">
            {items.map((r) => (
              <li key={r.id} className="w-[267px] shrink-0 snap-start sm:w-auto">
                {renderCardBody(r)}
              </li>
            ))}
          </ul>
        )}

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
