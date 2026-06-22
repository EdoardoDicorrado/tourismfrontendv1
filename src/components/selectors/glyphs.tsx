/* Shared inline UI glyphs for the selectors (pure geometry, currentColor). */

export function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="9"
      height="14"
      viewBox="0 0 9 14"
      fill="none"
      className={dir === "left" ? "rotate-180" : ""}
      aria-hidden
    >
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="text-ink" aria-hidden>
      <circle cx="9" cy="5" r="3.2" />
      <path d="M2.5 16c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6z" />
    </svg>
  );
}

export function CalendarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-ink" aria-hidden>
      <rect x="1.5" y="3" width="15" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M1.5 7h15M5.5 1.5v3M12.5 1.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CheckCircle({ size = 20 }: { size?: number } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="10" fill="white" />
      <path d="M5.5 10.5l2.8 2.8 6-6.2" stroke="#007ca2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Round stepper button used by the participants and month controls. */
export function Stepper({ children, ...rest }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="flex h-7 w-7 items-center justify-center rounded-full border border-stroke text-ink transition hover:border-cta hover:text-cta disabled:opacity-30 disabled:hover:border-stroke disabled:hover:text-ink"
      {...rest}
    >
      {children}
    </button>
  );
}

/** cta circle with a × — the selector overlay close affordance. */
export function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cta text-white transition hover:bg-[color-mix(in_oklab,var(--color-cta),white_15%)] active:bg-[color-mix(in_oklab,var(--color-cta),black_12%)]"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** Full-width bordered trigger pill (booking box fields). */
export function FieldButton({
  icon,
  label,
  active,
  onClick,
  id,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={active}
      aria-controls={id}
      className={`flex w-full items-center justify-center gap-2.5 rounded-full border bg-white px-4 py-4 text-base font-bold text-ink transition-colors ${
        active ? "border-cta" : "border-stroke hover:border-cta"
      }`}
    >
      <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
      {label}
    </button>
  );
}
