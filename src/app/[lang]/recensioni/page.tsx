import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ReviewCard, ReviewsList } from "@/components/reviews/ReviewsList";
import { Container } from "@/components/ui/Container";
import { reviewsSummary } from "@/data/home";
import { morePlatformReviews, pageReviews } from "@/data/reviews";
import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.reviewsPage.meta.title,
    description: dict.reviewsPage.meta.description,
  };
}

/**
 * "Esplora le recensioni" (`/[lang]/recensioni`) — a curated selection of
 * traveler reviews, shown fully expanded and sortable (most recent first by
 * default). Linked from the homepage and listing "Esplora le recensioni" CTA.
 */
export default async function ReviewsPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <section className="py-6 sm:py-10">
          <Container>
            <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
              {dict.reviewsPage.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-ink">{dict.reviewsPage.subtitle}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
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
                <strong className="font-bold">{reviewsSummary.count.toLocaleString(lang)}</strong>{" "}
                {dict.common.reviews}
              </span>
            </div>
          </Container>
        </section>

        <section className="pb-8">
          <Container>
            <ReviewsList lang={lang} dict={dict} reviews={pageReviews} />
          </Container>
        </section>

        <section className="pb-12">
          <Container>
            <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
              {dict.reviewsPage.moreTitle}
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {morePlatformReviews.map((r) => (
                <li key={r.id}>
                  <ReviewCard review={r} lang={lang} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
