"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { GalleryImage } from "@/data/product";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Chevron } from "@/components/selectors/glyphs";

/** "images" glyph for the "Mostra galleria" pill (pure geometry, currentColor). */
function GalleryGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="2.5" y="4.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M18.5 7v8.5a2 2 0 0 1-2 2H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="6.5" cy="8" r="1.3" fill="currentColor" />
      <path d="M3 14l3-3 3 2.5 2.5-2 3 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Product image gallery — single large image with overlay back button,
 * "Mostra galleria" pill and pagination dots; the pill opens a grid lightbox.
 * Figma frame "Promo" 64:9937 (mobile, ~361×400, rounded-[15px]).
 * Swipe gesture + slide transition between images are intentionally left to
 * `animations-1` (motion); dot/lightbox switching here is plain state.
 */
export function ProductGallery({
  images,
  dict,
  fallbackHref,
}: {
  images: GalleryImage[];
  dict: Dictionary;
  /** Where to go when the page was opened directly (no in-app history to go back to). */
  fallbackHref?: string;
}) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  // +1 = la nuova immagine entra da destra (avanti), -1 = da sinistra (indietro).
  const [direction, setDirection] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = images[active] ?? images[0];

  // Lo swiper principale mostra al MASSIMO 4 immagini, a loop; la lightbox
  // ("Mostra galleria") resta l'unico punto in cui si vedono TUTTE.
  const swiperImages = images.slice(0, 4);
  const swiperCount = swiperImages.length;

  /** Vai avanti (+1) o indietro (-1) tra le immagini dello swiper, con wrap. */
  const paginate = (dir: number) => {
    if (swiperCount <= 1) return;
    setDirection(dir);
    setActive((a) => {
      const cur = a < swiperCount ? a : swiperCount - 1; // clamp (es. pick da lightbox oltre il cap)
      return (cur + dir + swiperCount) % swiperCount;
    });
  };

  /** Salta a un indice preciso (dots / lightbox) calcolando la direzione dello slide. */
  const goTo = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  // Slide orizzontale tra le immagini; reduced-motion → solo dissolvenza (niente x).
  const slideVariants = {
    enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%", opacity: 0 }),
  };
  const SWIPE_THRESHOLD = 60; // px di trascinamento oltre cui si cambia foto

  // Back = the actual previous view the user came from. If there's no in-app
  // history (deep link / new tab / refresh), `router.back()` would dead-end, so
  // fall back to the city listing instead.
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else if (fallbackHref) router.push(fallbackHref);
    else router.back();
  };

  // Lock body scroll and wire Escape while the lightbox is open.
  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  return (
    <div className="relative aspect-[361/400] w-full overflow-hidden rounded-[15px] sm:aspect-[16/9]">
      {/* Immagine principale: drag orizzontale per scorrere lo swiper (cap 4, loop).
          Ogni foto è keyata su `active` così entra/esce con slide; reduced-motion → fade. */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={active}
          custom={direction}
          className="absolute inset-0"
          variants={slideVariants}
          initial={reduceMotion ? { opacity: 0 } : "enter"}
          animate={reduceMotion ? { opacity: 1 } : "center"}
          exit={reduceMotion ? { opacity: 0 } : "exit"}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { x: { type: "spring", stiffness: 320, damping: 34 }, opacity: { duration: 0.2 } }
          }
          drag={swiperCount > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          dragMomentum={false}
          onDragEnd={(_event, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -400) paginate(1);
            else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 400) paginate(-1);
          }}
        >
          <Image
            src={current.src}
            alt={current.alt}
            fill
            priority
            draggable={false}
            sizes="(max-width: 1024px) 100vw, 800px"
            className="select-none object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Top overlay: back button (left) + "Mostra galleria" pill (right) */}
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label={dict.gallery.back}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:bg-white/90 active:scale-95"
        >
          <Chevron dir="left" />
        </button>

        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="flex items-center gap-2 rounded-[5px] border border-white bg-black/10 px-2 py-2 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-black/25 active:scale-95"
        >
          <GalleryGlyph />
          {dict.gallery.showGallery}
        </button>
      </div>

      {/* Pagination dots — limitati allo swiper (max 4), sincronizzati con l'indice. */}
      {swiperCount > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5">
          {swiperImages.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={fill(dict.gallery.showImage, { n: String(i + 1) })}
              aria-pressed={i === active}
              className={`rounded-full transition-all ${
                i === active ? "h-2.5 w-2.5 bg-white" : "h-2 w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* "Mostra galleria" lightbox — static grid of all images (no motion). */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dict.gallery.showGallery}
          className="fixed inset-0 z-[120] flex flex-col bg-black/95"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-bold text-white">
              {active + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              aria-label={dict.gallery.close}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 overflow-y-auto px-4 pb-8">
            {images.map((img, i) => (
              <button
                key={img.src + i}
                type="button"
                onClick={() => {
                  goTo(i);
                  setLightbox(false);
                }}
                aria-label={fill(dict.gallery.showImage, { n: String(i + 1) })}
                className={`relative aspect-[4/3] overflow-hidden rounded-[10px] ring-2 transition ${
                  i === active ? "ring-cta" : "ring-transparent hover:ring-white/60"
                }`}
              >
                <Image src={img.src} alt={img.alt} fill sizes="50vw" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
