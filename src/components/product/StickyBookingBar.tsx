"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ProductDetail } from "@/data/product";
import { Badge } from "@/components/ui/Badge";
import { buttonVariants } from "@/components/ui/buttonVariants";
import { agencyPrice } from "@/lib/account/agency-pricing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Mobile-only sticky bottom bar ("Disponibilità show", Figma 76:13990): tour
 * thumbnail + title + urgency badge on the left, and a right-aligned price block
 * — struck "da {oldPrice}" on top (CTA blue) + the big price below (red when
 * discounted, ink otherwise) — over a full-width CTA that jumps to the booking
 * box (#prenota). Hidden on lg where the sticky sidebar is visible.
 *
 * Visibility: it only appears once the booking box (`#prenota`) has scrolled
 * ABOVE the viewport (so the inline CTA is no longer reachable), and hides again
 * when the `<footer>` comes into view. Driven by two IntersectionObservers so
 * there's no scroll handler on the main thread. The slide is a plain CSS
 * transform transition (disabled under prefers-reduced-motion); a richer
 * entrance is `animations`' to add.
 */
export function StickyBookingBar({
  product,
  dict,
  isAgency = false,
}: {
  product: ProductDetail;
  dict: Dictionary;
  /** Logged-in agency → mirror the booking box: struck public price + red agency price. */
  isAgency?: boolean;
}) {
  const thumb = product.gallery[0];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const box = document.getElementById("prenota");
    // Target the SITE footer by id, NOT querySelector("footer"): the first <footer>
    // in the DOM is the off-canvas UserMenu drawer's, which IntersectionObserver
    // reports as intersecting even when translated off-screen → the bar would never show.
    const footer = document.getElementById("site-footer");
    let pastBox = false;
    let footerIn = false;
    const update = () => setVisible(pastBox && !footerIn);

    const boxObs = new IntersectionObserver(([e]) => {
      // "past the box" = the booking box has scrolled above the viewport top.
      pastBox = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    });
    if (box) boxObs.observe(box);

    const footerObs = new IntersectionObserver(([e]) => {
      footerIn = e.isIntersecting;
      update();
    });
    if (footer) footerObs.observe(footer);

    return () => {
      boxObs.disconnect();
      footerObs.disconnect();
    };
  }, []);

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 rounded-t-[15px] border-t border-soft-grey bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-[760px] flex-col gap-3">
        <div className="flex items-center gap-3">
          {thumb && (
            <span className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-[10px]">
              <Image src={thumb.src} alt="" fill sizes="72px" className="object-cover" />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="line-clamp-2 text-sm font-extrabold leading-tight text-ink">
              {product.title}
            </p>
            {product.badge && (
              <Badge tone="ink" size="sm" className="self-start">
                {dict.sticky.urgency}
              </Badge>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end leading-tight">
            {isAgency ? (
              <span className="text-xs font-medium text-cta line-through">
                {dict.sticky.from} {product.priceFrom}
                {product.currency}
              </span>
            ) : product.oldPrice ? (
              <span className="text-xs font-medium text-cta line-through">
                {dict.sticky.from} {product.oldPrice}
                {product.currency}
              </span>
            ) : (
              <span className="text-xs font-medium text-ink/70">{dict.sticky.from}</span>
            )}
            <span
              className={`text-2xl font-extrabold leading-none ${
                isAgency || product.oldPrice ? "text-badge" : "text-ink"
              }`}
            >
              {isAgency ? agencyPrice(product.priceFrom) : product.priceFrom}
              {product.currency}
            </span>
          </div>
        </div>
        {/* href resta per a11y + fallback no-JS; l'onClick fa lo scroll SMOOTH alla
            BookingBox (#prenota) invece del salto nativo. reduced-motion → istantaneo.
            block:start + lo `scroll-mt-*` del target danno l'offset sotto l'header. */}
        <a
          href="#prenota"
          onClick={(e) => {
            const target = document.getElementById("prenota");
            if (!target) return; // niente target → lascia il jump nativo
            e.preventDefault();
            const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
          }}
          className={buttonVariants({ size: "md", fullWidth: true })}
        >
          {dict.sticky.checkAvailability}
        </a>
      </div>
    </div>
  );
}
