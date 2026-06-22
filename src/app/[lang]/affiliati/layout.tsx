import type { Metadata } from "next";
import type { ReactNode } from "react";

// Intera area privata: fuori dall'indice (vedi audit SEO).
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
