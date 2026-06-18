import Image from "next/image";

import type { ProductDetail } from "@/data/product";
import { buttonVariants } from "@/components/ui/buttonVariants";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Mobile-only sticky bottom bar ("Disponibilità show", Figma 76:13990): tour
 * thumbnail + title + urgency badge + price, with a full-width CTA that jumps to
 * the booking box (#prenota). Hidden on lg where the sticky sidebar is visible.
 */
export function StickyBookingBar({ product, dict }: { product: ProductDetail; dict: Dictionary }) {
  const thumb = product.gallery[0];

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-soft-grey bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-[760px] flex-col gap-3">
        <div className="flex items-center gap-3">
          {thumb && (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[10px]">
              <Image src={thumb.src} alt="" fill sizes="48px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{product.title}</p>
            <p className="text-sm text-ink">
              {product.badge && (
                <span className="mr-2 rounded-[4px] bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {dict.sticky.urgency}
                </span>
              )}
              {product.oldPrice && (
                <span className="text-ink/60">
                  {dict.sticky.from}{" "}
                  <span className="line-through">{product.oldPrice}{product.currency}</span>{" "}
                </span>
              )}
              <span className="font-extrabold text-badge">
                {product.priceFrom}
                {product.currency}
              </span>
            </p>
          </div>
        </div>
        <a href="#prenota" className={buttonVariants({ size: "md", fullWidth: true })}>
          {dict.sticky.checkAvailability}
        </a>
      </div>
    </div>
  );
}
