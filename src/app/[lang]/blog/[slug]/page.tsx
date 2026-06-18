import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blog/ArticleCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import {
  articleSlugs,
  formatArticleDate,
  getArticle,
  getCategories,
  getRelatedArticles,
} from "@/data/blog";
import { fill, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type Params = { lang: string; slug: string };

/** Pre-render the known article slugs; new ones render on demand. */
export function generateStaticParams(): { slug: string }[] {
  return articleSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const article = getArticle(lang, slug);
  if (!article) return {};
  return { title: `${article.title} — TourisMotion`, description: article.excerpt };
}

/**
 * Blog article (`/[lang]/blog/[slug]`) — hero image, title, meta, body, a
 * "book now" CTA, two "see all tours" cards and related articles. Figma
 * "Blog Articolo // Mobile" (447:2540). Unknown slugs 404.
 */
export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const article = getArticle(lang, slug);
  if (!article) notFound();

  const dict = await getDictionary(lang);
  const categories = getCategories(lang);
  const labelFor = (id: string) => categories.find((c) => c.id === id)?.label ?? id;
  const categoryLabel = labelFor(article.categoryId);
  const related = getRelatedArticles(lang, slug);
  const bookHref = `/${lang}/attivita/${article.bookCitySlug}`;

  const tourCards = [
    { image: article.tourImages[0], label: fill(dict.blog.viewAllTours, { city: article.bookCity }) },
    {
      image: article.tourImages[1],
      label: fill(dict.blog.discoverExperiences, { city: article.bookCity }),
    },
  ];

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <div className="relative h-60 w-full border-b border-soft-grey sm:h-80 lg:h-[420px]">
          <Image src={article.image} alt="" fill priority sizes="100vw" className="object-cover" />
        </div>

        <Container className="py-10 sm:py-14">
          <article className="mx-auto max-w-[760px]">
            <Link
              href={`/${lang}/blog`}
              className="text-sm font-semibold text-cta hover:underline"
            >
              ← {dict.blog.backToBlog}
            </Link>

            <h1 className="mt-4 text-3xl font-extrabold text-ink sm:text-4xl">{article.title}</h1>
            <p className="mt-3 text-lg font-semibold text-ink/90">{article.excerpt}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
              <span>{formatArticleDate(article.date, lang)}</span>
              <span aria-hidden>·</span>
              <span>{dict.blog.by}</span>
              <span aria-hidden>·</span>
              <span>{fill(dict.blog.postedIn, { category: categoryLabel })}</span>
              <span aria-hidden>·</span>
              <span>{fill(dict.blog.readingTime, { min: String(article.readingMinutes) })}</span>
            </div>

            <div className="mt-8 flex flex-col gap-5">
              {article.body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-ink/90">
                  {paragraph}
                </p>
              ))}
            </div>

            <ButtonLink href={bookHref} size="lg" className="mt-8">
              {fill(dict.blog.book, { city: article.bookCity })}
            </ButtonLink>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {tourCards.map((card) => (
                <Link
                  key={card.label}
                  href={bookHref}
                  className="group overflow-hidden rounded-[10px] bg-soft transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 90vw, 380px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="p-4 font-extrabold text-ink">{card.label}</p>
                </Link>
              ))}
            </div>
          </article>

          {related.length > 0 && (
            <div className="mx-auto mt-14 max-w-[1100px]">
              <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.blog.related}</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    lang={lang}
                    article={a}
                    categoryLabel={labelFor(a.categoryId)}
                    dict={dict.blog}
                  />
                ))}
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
