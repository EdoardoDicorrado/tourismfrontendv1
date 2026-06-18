/** Generic titled text block ("Cose da sapere", "Accessibilità"). Figma 64:10390 / 64:10567. */
export function TextSection({ title, text }: { title: string; text: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{title}</h2>
      <p className="text-base text-ink/80">{text}</p>
    </section>
  );
}
