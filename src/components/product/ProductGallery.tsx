"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { GalleryImage } from "@/data/product";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Chevron } from "@/components/selectors/glyphs";
import { spring } from "@/lib/motion/tokens";

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
 * "Mostra galleria" pill, plus a thumbnail strip below; the pill opens a grid lightbox.
 * Figma frame "Promo" 64:9937 (mobile, ~361×400, rounded-panel).
 * Swipe gesture + slide transition between images (main swiper AND lightbox viewer)
 * are owned by `animations-1` (motion); the lightbox also auto-scrolls its active
 * thumbnail into view. Thumbnail/lightbox *layout* + state switching = plain state.
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
  // Strip miniature DENTRO la lightbox (overflow-x): la usiamo per auto-scrollare
  // la miniatura attiva in vista quando cambia immagine (vedi effect più sotto).
  const lightboxStripRef = useRef<HTMLDivElement>(null);

  // Lo swiper principale (e la strip miniature sotto) mostrano al MASSIMO 4 immagini;
  // la lightbox ("Mostra galleria") resta l'unico punto in cui si vedono TUTTE.
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

  /** Salta a un indice preciso (miniature / lightbox) calcolando la direzione dello slide. */
  const goTo = (i: number) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  /** Avanti/indietro su TUTTE le immagini, con wrap — usato dallo swipe della lightbox
   *  (lo swiper main è capato a 4; la lightbox naviga l'intero set, come le frecce). */
  const paginateAll = (dir: number) => {
    if (images.length <= 1) return;
    setDirection(dir);
    setActive((a) => (a + dir + images.length) % images.length);
  };

  // Slide orizzontale NETTO tra le immagini: solo `x`, NIENTE opacity (niente
  // dissolvenza/ghosting). Le due foto restano piene mentre una esce a sinistra
  // e l'altra entra da destra. reduced-motion → cambio istantaneo (transition 0).
  const slideVariants = {
    enter: (dir: number) => ({ x: dir >= 0 ? "100%" : "-100%" }),
    center: { x: 0 },
    exit: (dir: number) => ({ x: dir >= 0 ? "-100%" : "100%" }),
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

  // Mini-galleria della lightbox: tieni la miniatura attiva sempre a vista. Quando
  // `active` cambia (swipe/frecce/tap) scrolla la strip per centrarla. `block:nearest`
  // evita scroll verticali della pagina; reduced-motion → salto istantaneo.
  useEffect(() => {
    if (!lightbox) return;
    const el = lightboxStripRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active, lightbox, reduceMotion]);

  // Desktop (lg+): galleria a 2 col → strip miniature VERTICALE a sinistra
  // (lg:order-1) + immagine principale a destra (lg:order-2). Mobile invariato:
  // immagine sopra, strip orizzontale sotto.
  return (
    <div className="w-full lg:flex lg:items-stretch lg:gap-3">
      <div className="relative aspect-[361/400] w-full overflow-hidden rounded-panel sm:aspect-[16/9] lg:order-2 lg:aspect-[3/2] lg:w-auto lg:flex-1">
        {/* Immagine principale: drag orizzontale per scorrere lo swiper (cap 4, loop).
            Ogni foto è keyata su `active` così entra/esce con slide netto (solo x, no fade);
            reduced-motion → cambio istantaneo. */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            className="absolute inset-0"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduceMotion ? { duration: 0 } : { x: spring }}
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
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3 lg:justify-end">
          {/* "Torna indietro": solo mobile — su desktop resta la nav del sito (Edoardo). */}
          <button
            type="button"
            onClick={goBack}
            aria-label={dict.gallery.back}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:bg-white/90 active:scale-95 lg:hidden"
          >
            <Chevron dir="left" />
          </button>

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="flex items-center gap-2 rounded-badge border border-white bg-black/10 px-2 py-2 text-sm font-extrabold text-white backdrop-blur-sm transition hover:bg-black/25 active:scale-95"
          >
            <GalleryGlyph />
            {dict.gallery.showGallery}
          </button>
        </div>

        {/* "Mostra galleria" lightbox — full-screen VIEWER: immagine grande centrale
            (object-contain) con frecce prev/next + mini-galleria scrollabile sotto.
            Navigazione/layout = qui (stato). ZOOM (pinch/double-tap/pan), swipe e
            auto-scroll-into-view della miniatura attiva = gesture/motion → animations-1. */}
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

            {/* Immagine grande centrale + frecce. Drag orizzontale per scorrere TUTTE
                le immagini (swipe), con lo stesso slide netto dello swiper principale;
                reduced-motion → cambio istantaneo. (Zoom pinch/double-tap = TODO motion.) */}
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={active}
                  custom={direction}
                  className="absolute inset-0"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reduceMotion ? { duration: 0 } : { x: spring }}
                  drag={images.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  dragMomentum={false}
                  onDragEnd={(_event, info) => {
                    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -400) paginateAll(1);
                    else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 400) paginateAll(-1);
                  }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    draggable={false}
                    sizes="100vw"
                    className="select-none object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goTo((active - 1 + images.length) % images.length)}
                    aria-label={fill(dict.gallery.showImage, {
                      n: String(((active - 1 + images.length) % images.length) + 1),
                    })}
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
                  >
                    <Chevron dir="left" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo((active + 1) % images.length)}
                    aria-label={fill(dict.gallery.showImage, {
                      n: String(((active + 1) % images.length) + 1),
                    })}
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
                  >
                    <Chevron dir="right" />
                  </button>
                </>
              )}
            </div>

            {/* Mini-galleria: strip orizzontale di TUTTE le immagini. Tap → goTo(i) (resta
                nel viewer, non chiude). Attiva = ring-cta. La miniatura attiva viene
                auto-scrollata in vista (effect su `active`) ad ogni cambio immagine. */}
            {images.length > 1 && (
              <div ref={lightboxStripRef} className="flex gap-2 overflow-x-auto px-4 py-3">
                {images.map((img, i) => (
                  <button
                    key={img.src + i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={fill(dict.gallery.showImage, { n: String(i + 1) })}
                    aria-pressed={i === active}
                    className={`relative aspect-[4/3] h-16 shrink-0 overflow-hidden rounded-card ring-2 transition ${
                      i === active ? "ring-cta" : "ring-transparent hover:ring-white/60"
                    }`}
                  >
                    <Image src={img.src} alt={img.alt} fill sizes="120px" className="select-none object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail strip — sotto l'immagine grande, mirror dello swiper (cap 4).
          Tap su una miniatura → goTo(i); la miniatura attiva è marcata con ring-cta
          (stesso pattern della lightbox). SOSTITUISCE i pagination dots: la strip
          indica già posizione + contenuto. Divergenza voluta dal Figma 64:9937 (che
          mostra i dots) — feature richiesta da animations-1.
          FISSA: 4 miniature flex-1 entrano tutte nella riga → MAI scroll, niente
          auto-scroll-into-view. Indici 0..3 (swiperImages) così goTo(i) resta valido;
          le foto oltre il cap-4 restano visibili solo nella lightbox. */}
      {swiperCount > 1 && (
        <div className="mt-2 flex gap-2 lg:order-1 lg:mt-0 lg:w-44 lg:shrink-0 lg:flex-col">
          {swiperImages.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={fill(dict.gallery.showImage, { n: String(i + 1) })}
              aria-pressed={i === active}
              className={`relative aspect-[4/3] flex-1 overflow-hidden rounded-card ring-2 transition lg:aspect-auto lg:w-full lg:flex-1 ${
                i === active ? "ring-cta" : "ring-transparent hover:ring-ink/20"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                draggable={false}
                sizes="25vw"
                className="select-none object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
