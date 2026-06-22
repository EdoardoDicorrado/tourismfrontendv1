import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blog/ArticleCard";
import { BlogCategories } from "@/components/blog/BlogCategories";
import { BlogHero } from "@/components/blog/BlogHero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CardSlider } from "@/components/ui/CardSlider";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticles, getCategories, getFeaturedArticle } from "@/data/blog";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absUrl } from "@/lib/seo/config";
import { breadcrumbLd, itemListLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

type Params = { lang: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return buildMetadata({
    lang,
    path: "/blog",
    title: dict.blog.meta.title,
    description: dict.blog.meta.description,
  });
}

/**
 * Blog index (`/[lang]/blog`) — featured hero, latest articles, category
 * explorer and a "book now" CTA. Figma "Blog // Mobile" (447:2342). Content is
 * served from per-locale fixtures (`@/data/blog`) until a content API exists.
 */
export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const categories = getCategories(lang);
  const articles = getArticles(lang);
  const featured = getFeaturedArticle(lang);
  const latest = articles.filter((a) => a.slug !== featured.slug).slice(0, 4);
  // Hero slider: l'articolo in evidenza + gli ultimi, che ruotano nello slider.
  const heroArticles = [featured, ...latest];
  const labelFor = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  const articleUrls = articles.map((a) => absUrl(`/${lang}/blog/${a.slug}`));

  return (
    <>
      <JsonLd
        data={[
          itemListLd(articleUrls),
          breadcrumbLd([
            { name: "Home", path: `/${lang}` },
            { name: "Blog", path: `/${lang}/blog` },
          ]),
        ]}
      />
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <BlogHero lang={lang} dict={dict} articles={heroArticles} />

        <section className="pt-8 pb-6 lg:py-12">
          <Container>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl lg:text-4xl">{dict.blog.latest}</h2>
            {/* Mobile: slider 4 articoli (altezze uguali, full-bleed). Desktop (Figma
                605:2005): griglia di 2 card grandi verticali; le altre 2 sono lg:hidden. */}
            <CardSlider
              label={dict.common.nextCard}
              className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:px-0 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-10"
            >
              {latest.map((a, i) => (
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
          </Container>
        </section>

        <BlogCategories
          lang={lang}
          dict={dict.blog}
          categories={categories}
          articles={articles}
          bookCity={featured.bookCity}
          bookCitySlug={featured.bookCitySlug}
        />
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
