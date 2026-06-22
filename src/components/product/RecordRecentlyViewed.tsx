"use client";

import { useEffect } from "react";

import type { Product } from "@/data/home";
import { recordViewed } from "@/lib/recentlyViewed";

/**
 * Records the opened tour into the client "recently viewed" store (fires once on
 * mount). Rendered on the product detail page; feeds the home "Sei ancora
 * interessato a:" row. Renders nothing.
 */
export function RecordRecentlyViewed({ product }: { product: Product }) {
  useEffect(() => {
    recordViewed(product);
  }, [product]);
  return null;
}
