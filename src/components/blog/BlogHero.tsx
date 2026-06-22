"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { BlogArticle } from "@/data/blog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Auto-advance interval (ms) between hero slides. */
const ROTATE_MS = 5000;

/**
 * Blog hero — Figma "Blog // Mobile" (447:2346): ~489px tall, title + CTA CENTERED
 * at the bottom over an image backdrop, carousel dots below. Now a real slider that
 * ROTATES through the latest blog articles (crossfade); the dots show the current
 * position and jump to a slide on tap. Auto-advance loops, pausing on hover/focus
 * and under `prefers-reduced-motion` (WCAG 2.2.2 — moving content stays controllable).
 */
export function BlogHero({
  lang,
  dict,
  articles,
}: {
  lang: Locale;
  dict: Dictionary;
  articles: BlogArticle[];
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = articles.length > 0 ? articles : [];
  const count = slides.length;

  useEffect(() => {
    if (reduce || paused || count <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % count), ROTATE_MS);
    return () => clearInterval(id);
  }, [reduce, paused, count]);

  if (count === 0) return null;
  const article = slides[index] ?? slides[0];

  return (
    <section
      className="relative isolate flex min-h-[489px] flex-col justify-end overflow-hidden border-b border-soft-grey"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={dict.blog.latest}
    >
      {/* Crossfade tra le immagini dei vari articoli. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={article.slug}
          className="absolute inset-0 -z-20"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.6 }}
        >
          <Image src={article.image} alt="" fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/40 to-black/10"
      />

      <Container className="pb-7 pt-16">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-sm sm:text-4xl">
            {article.title}
          </h1>
          <ButtonLink href={`/${lang}/blog/${article.slug}`} size="lg" fullWidth>
            {dict.blog.hero.cta}
          </ButtonLink>
          {count > 1 && (
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.slug}
                  type="button"
                  aria-label={s.title}
                  aria-current={i === index ? "true" : undefined}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
