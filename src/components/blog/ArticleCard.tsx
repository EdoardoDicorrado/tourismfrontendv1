import Image from "next/image";
import Link from "next/link";

import type { BlogArticle } from "@/data/blog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Vertical article card — image, category, title, excerpt and the "read more"
 * link. Used in "Ultimi articoli" and "Articoli correlati". Figma node 447:2580.
 */
export function ArticleCard({
  lang,
  article,
  categoryLabel,
  dict,
}: {
  lang: Locale;
  article: BlogArticle;
  categoryLabel: string;
  dict: Dictionary["blog"];
}) {
  return (
    <Link
      href={`/${lang}/blog/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-soft transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[2/1] w-full overflow-hidden">
        <Image
          src={article.image}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-cta">{categoryLabel}</p>
        <h3 className="font-extrabold text-ink">{article.title}</h3>
        <p className="line-clamp-2 text-xs text-ink/70">{article.excerpt}</p>
        <span className="mt-auto pt-1 text-sm font-extrabold text-cta group-hover:underline">
          {dict.readMore}
        </span>
      </div>
    </Link>
  );
}
