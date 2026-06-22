import Image from "next/image";
import Link from "next/link";

import { Stars } from "@/components/ui/Stars";
import { Disclosure } from "@/components/ui/Disclosure";

/** A single feature chip (icon + label) in the order summary, e.g. "Durata 4 Ore".
 *  `icon` is an optional image src; senza, si usa l'icona di default qui sotto. */
export type SummaryFeature = { icon?: string; label: string };

/** Default feature glyph (Figma "watch-square-minimalistic-charge", 27×27, colore cta) —
 *  usato quando la feature non porta un'icona propria. */
function FeatureGlyph() {
  return (
    <svg width="27" height="27" viewBox="0 0 27 27" fill="none" className="shrink-0 text-cta" aria-hidden>
      <rect x="5.5" y="5.5" width="16" height="16" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 3.5h6M10.5 23.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 9.5l-3 4.2h2.4l-1 3.8 3.4-4.6h-2.4z" fill="currentColor" />
    </svg>
  );
}

/**
 * Free-cancellation callout — the soft-green box from the Figma (nodes 76:14244 /
 * 76:15806). Reused in the summary card and next to the step-1 CTA.
 */
export function CancellationBox({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex w-full items-start gap-4 rounded-card bg-soft-success p-4">
      <Image
        src="/images/icon-cancellation.svg"
        alt=""
        width={41}
        height={41}
        className="shrink-0"
      />
      <div className="flex flex-col gap-2 text-ink">
        <p className="text-base font-semibold">{title}</p>
        {note && <p className="text-sm font-medium">{note}</p>}
      </div>
    </div>
  );
}

/**
 * Order summary card — Figma "Checkout// Mobile" (node 76:14193). Pure presentational.
 *
 * `collapsible` → fisarmonica (primitiva Disclosure): CHIUSA mostra una riga compatta
 * con IMMAGINE a sinistra e a destra titolo + rating + prezzo + data + partecipanti;
 * APERTA aggiunge sotto features e cancellazione/risparmio. Usata sempre nel checkout
 * (anche con un solo prodotto). Blocchi opzionali compaiono solo se forniti.
 */
export function OrderSummaryCard({
  image,
  title,
  rating,
  features,
  price,
  dateLabel,
  paxLines,
  cancellationLabel,
  cancellationNote,
  savingsLabel,
  collapsible = false,
  defaultOpen = false,
  editHref,
  editLabel,
}: {
  image: string;
  title: string;
  rating?: number;
  features?: SummaryFeature[];
  price: string;
  dateLabel: string;
  paxLines: string[];
  cancellationLabel?: string;
  cancellationNote?: string;
  savingsLabel?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** When set, a top-right "Modifica" link to change this booking (e.g. step 1). */
  editHref?: string;
  editLabel?: string;
}) {
  const editLink =
    editHref && editLabel ? (
      <Link
        href={editHref}
        className="text-sm font-bold text-cta hover:underline"
      >
        {editLabel}
      </Link>
    ) : null;
  const ratingRow = typeof rating === "number" && (
    <span className="flex items-center gap-1.5">
      <span className="text-xl font-extrabold text-ink">{rating.toFixed(1)}</span>
      <Stars value={rating} size={23} />
    </span>
  );

  const paxRow = paxLines.length > 0 && (
    <span className="flex flex-wrap items-center gap-2">
      {paxLines.map((line, i) => (
        <span key={line} className="flex items-center gap-2">
          {i > 0 && <span className="size-[5px] shrink-0 rounded-full bg-ink" aria-hidden />}
          <span className="text-sm font-medium leading-6 text-ink">{line}</span>
        </span>
      ))}
    </span>
  );

  const featuresBlock = features && features.length > 0 && (
    <>
      <hr className="border-stroke-2" />
      <div className="flex flex-wrap gap-x-6 gap-y-4">
        {features.map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            {f.icon ? (
              <Image src={f.icon} alt="" width={27} height={27} className="shrink-0" />
            ) : (
              <FeatureGlyph />
            )}
            <span className="text-[15px] font-bold leading-6 text-ink">{f.label}</span>
          </div>
        ))}
      </div>
    </>
  );

  const cancelSavings = (cancellationLabel || savingsLabel) && (
    <>
      <hr className="border-stroke-2" />
      <div className="flex flex-col gap-2">
        {cancellationLabel && <CancellationBox title={cancellationLabel} note={cancellationNote} />}
        {savingsLabel && (
          <div className="flex w-full items-center rounded-card bg-soft p-4">
            <p className="text-base font-semibold text-ink">{savingsLabel}</p>
          </div>
        )}
      </div>
    </>
  );

  // Fisarmonica: CHIUSA = immagine (sx) + titolo/rating/prezzo/data/partecipanti (dx) come
  // header cliccabile; APERTA = aggiunge features + cancellazione/risparmio (cambia forma).
  if (collapsible) {
    return (
      <div className="w-full rounded-card border border-stroke-2 px-4">
        {editLink && <div className="flex justify-end pt-3">{editLink}</div>}
        <Disclosure
          divided={false}
          defaultOpen={defaultOpen}
          summary={
            <span className="flex min-w-0 flex-1 items-start gap-4 pr-2 text-left">
              {image && (
                <span className="relative aspect-square w-[88px] shrink-0 self-start overflow-hidden rounded-panel">
                  <Image src={image} alt="" fill sizes="88px" className="object-cover" />
                </span>
              )}
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-base font-bold leading-tight text-ink">{title}</span>
                {ratingRow}
                <span className="text-xl font-extrabold text-ink">{price}</span>
                <span className="text-sm font-bold text-ink">{dateLabel}</span>
                {paxRow}
              </span>
            </span>
          }
        >
          <div className="flex flex-col gap-6 pt-2">
            {featuresBlock}
            {cancelSavings}
          </div>
        </Disclosure>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-card border border-stroke-2 px-4 py-6">
      {/* Tour + rating */}
      <div className="flex w-full gap-6">
        {image && (
          <span className="relative w-[108px] shrink-0 self-stretch overflow-hidden rounded-panel">
            <Image src={image} alt="" fill sizes="108px" className="object-cover" />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <p className="text-base font-bold leading-tight text-ink">{title}</p>
          {ratingRow}
        </div>
      </div>

      {featuresBlock}

      <hr className="border-stroke-2" />
      <div className="flex flex-col gap-2">
        <p className="text-2xl font-extrabold text-ink">{price}</p>
        <p className="text-base font-bold text-ink">{dateLabel}</p>
        {paxRow}
      </div>

      {cancelSavings}
    </div>
  );
}
