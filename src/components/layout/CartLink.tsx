"use client";

import Image from "next/image";

import { useCart } from "@/lib/cart/CartContext";

/** Header cart button — opens the slide-in cart drawer, with a live item-count badge. */
export function CartLink({ label }: { label: string }) {
  const { count, hydrated, open, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={open}
      className="flex h-11 w-11 items-center justify-center text-cta"
    >
      <span className="relative">
        <Image src="/images/icon-cart.svg" alt="" width={24} height={24} unoptimized className="lg:size-6" />
        {hydrated && count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-badge px-1 text-[10px] font-bold leading-none text-white">
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
