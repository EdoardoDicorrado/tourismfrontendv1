import { Disclosure } from "@/components/ui/Disclosure";

/**
 * Generic titled text block ("Cose da sapere", "Accessibilità"). Figma 64:10390 /
 * 64:10567: a collapsible accordion — chevron next to the title and a separator
 * line under the section. Consumes the `Disclosure` primitive (native
 * `<details>`, server-safe); the smooth open/close animation is `animations`' to add.
 */
export function TextSection({ title, text }: { title: string; text: string }) {
  return (
    // Separator drawn here (cta #007CA2, 1px) instead of the primitive's default
    // soft-grey: `divided={false}` turns off Disclosure's own border so we don't
    // touch the design-system primitive (color is a product-page composition choice).
    <Disclosure
      defaultOpen
      divided={false}
      className="border-b border-cta"
      summary={<h2 className="text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>}
    >
      <p className="text-base text-ink/80">{text}</p>
    </Disclosure>
  );
}
