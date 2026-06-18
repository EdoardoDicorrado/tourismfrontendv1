"use client";

import Image from "next/image";
import { useState } from "react";

import type { GalleryImage } from "@/data/product";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Product image gallery — large active image + thumbnail strip. Figma frame "Promo" 64:9937. */
export function ProductGallery({ images, dict }: { images: GalleryImage[]; dict: Dictionary }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[15px] sm:aspect-[16/9]">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={fill(dict.gallery.showImage, { n: String(i + 1) })}
              aria-pressed={i === active}
              className={`relative aspect-[4/3] overflow-hidden rounded-[10px] ring-2 transition ${
                i === active ? "ring-cta" : "ring-transparent hover:ring-stroke-2"
              }`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="200px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
