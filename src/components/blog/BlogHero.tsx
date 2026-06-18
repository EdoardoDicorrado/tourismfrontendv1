import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getFeaturedArticle } from "@/data/blog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Blog hero — the featured article over an image backdrop, with a link to read
 * it. Figma node 447:2342 (Hero). The design shows a carousel; with a single
 * featured article we render it as a static spotlight.
 */
export function BlogHero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const article = getFeaturedArticle(lang);
  return (
    <section className="relative isolate flex min-h-[360px] items-end overflow-hidden border-b border-soft-grey sm:min-h-[440px]">
      <Image
        src={article.image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/35 to-black/10"
      />

      <Container className="py-10 sm:py-14">
        <div className="flex max-w-[680px] flex-col gap-5">
          <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <ButtonLink
            href={`/${lang}/blog/${article.slug}`}
            size="lg"
            className="self-start"
          >
            {dict.blog.hero.cta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
