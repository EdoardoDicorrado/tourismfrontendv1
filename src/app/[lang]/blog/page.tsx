import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/blog/ArticleCard";
import { BlogCategories } from "@/components/blog/BlogCategories";
import { BlogHero } from "@/components/blog/BlogHero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getArticles, getCategories, getFeaturedArticle } from "@/data/blog";
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
  return { title: dict.blog.meta.title, description: dict.blog.meta.description };
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
  const labelFor = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1">
        <BlogHero lang={lang} dict={dict} />

        <section className="py-12 sm:py-16">
          <Container>
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{dict.blog.latest}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {latest.map((a) => (
                <ArticleCard
                  key={a.slug}
                  lang={lang}
                  article={a}
                  categoryLabel={labelFor(a.categoryId)}
                  dict={dict.blog}
                />
              ))}
            </div>
          </Container>
        </section>

        <BlogCategories lang={lang} dict={dict.blog} categories={categories} articles={articles} />

        <section className="pb-14">
          <Container className="flex justify-center">
            <ButtonLink href={`/${lang}/attivita/${featured.bookCitySlug}`} size="lg">
              {fill(dict.blog.book, { city: featured.bookCity })}
            </ButtonLink>
          </Container>
        </section>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
