import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blog/ArticleCard";
import { BlogBackButton } from "@/components/blog/BlogBackButton";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { CardSlider } from "@/components/ui/CardSlider";
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
import { absUrl } from "@/lib/seo/config";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

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
  return buildMetadata({
    lang,
    path: `/blog/${slug}`,
    title: article.title,
    description: article.excerpt,
    image: article.image,
    type: "article",
  });
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

  const tourCards = article.tourImages.map((image, i) => ({
    image,
    label: article.tourLabels[i],
  }));

  const url = absUrl(`/${lang}/blog/${slug}`);
  const ld = articleLd({
    headline: article.title,
    description: article.excerpt,
    image: article.image.startsWith("/") ? absUrl(article.image) : article.image,
    datePublished: article.date,
    url,
  });
  const crumbs = breadcrumbLd([
    { name: "Home", path: `/${lang}` },
    { name: "Blog", path: `/${lang}/blog` },
    { name: article.title, path: url.replace(absUrl(""), "") || `/${lang}/blog/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={[ld, crumbs]} />
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <div className="relative h-60 w-full border-b border-soft-grey sm:h-80 lg:h-[520px]">
          <Image src={article.image} alt="" fill priority sizes="100vw" className="object-cover" />
          <BlogBackButton fallbackHref={`/${lang}/blog`} label={dict.gallery.back} />
        </div>

        <Container className="py-10 sm:py-14">
          {/* Desktop (Figma 605:2293): 2 colonne — SX immagine(=hero riusato)+excerpt+meta,
              DX titolo+corpo lungo; CTA e tour-card a tutta larghezza sotto. Le classi
              lg:col/row-start sono INERTI sotto lg (display block) → su mobile l'ordine
              DOM resta titolo→excerpt→meta→corpo (congelato). */}
          <article className="mx-auto max-w-[760px] lg:grid lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-x-10 lg:gap-y-4">
            {/* Immagine editoriale SX — solo desktop (hero riusato, scelta Edoardo). */}
            <div className="relative hidden aspect-[700/269] overflow-hidden rounded-card lg:col-start-1 lg:row-start-1 lg:block">
              <Image src={article.image} alt="" fill sizes="(min-width: 1024px) 45vw, 0px" className="object-cover" />
            </div>
            <h1 className="text-3xl font-extrabold text-ink sm:text-4xl lg:col-start-2 lg:row-start-1 lg:text-5xl">{article.title}</h1>
            <p className="mt-3 text-lg font-semibold text-ink/90 lg:col-start-1 lg:row-start-2 lg:mt-0">{article.excerpt}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60 lg:col-start-1 lg:row-start-3 lg:mt-0">
              <span>{formatArticleDate(article.date, lang)}</span>
              <span aria-hidden>·</span>
              <span>{dict.blog.by}</span>
              <span aria-hidden>·</span>
              <span>{fill(dict.blog.postedIn, { category: categoryLabel })}</span>
              <span aria-hidden>·</span>
              <span>{fill(dict.blog.readingTime, { min: String(article.readingMinutes) })}</span>
            </div>

            <div className="mt-8 flex flex-col gap-5 lg:col-start-2 lg:row-start-2 lg:row-span-2 lg:mt-0">
              {article.body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-relaxed text-ink/90">
                  {paragraph}
                </p>
              ))}
            </div>

            <ButtonLink href={bookHref} size="lg" className="mt-8 lg:col-span-2 lg:row-start-4 lg:mt-6">
              {fill(dict.blog.book, { city: article.bookCity })}
            </ButtonLink>

            <div className="mt-8 grid grid-cols-2 gap-4 lg:col-span-2 lg:row-start-5 lg:mt-6 lg:gap-10">
              {tourCards.map((card) => (
                <Link
                  key={card.label}
                  href={bookHref}
                  className="group overflow-hidden rounded-card bg-soft transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[120/73] w-full overflow-hidden">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 45vw, 360px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="p-4 text-base font-extrabold text-ink">{card.label}</p>
                </Link>
              ))}
            </div>
          </article>

          {related.length > 0 && (
            <div className="mx-auto mt-14 max-w-[1100px] lg:mt-16 lg:max-w-none">
              <h2 className="text-2xl font-extrabold text-ink sm:text-3xl lg:text-4xl">{dict.blog.related}</h2>
              {/* Mobile: slider. Desktop (Figma 605:2332): griglia 2 card (le altre lg:hidden). */}
              <CardSlider
                label={dict.common.nextCard}
                className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-2 lg:gap-10"
              >
                {related.map((a, i) => (
                  <li
                    key={a.slug}
                    className={`w-[267px] shrink-0 snap-start lg:w-auto ${i >= 2 ? "lg:hidden" : ""}`}
                  >
                    <ArticleCard
                      lang={lang}
                      article={a}
                      categoryLabel={labelFor(a.categoryId)}
                      dict={dict.blog}
                    />
                  </li>
                ))}
              </CardSlider>
            </div>
          )}
        </Container>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
