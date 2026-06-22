import { Fragment, type ReactNode } from "react";

/**
 * Render copy with `**bold**` runs as `font-extrabold` (same ink color) — mirrors
 * the inline bold used in the Figma agency-landing paragraphs. Odd split segments
 * are the captured bold runs.
 */
export function Rich({ text }: { text: string }): ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-extrabold">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
