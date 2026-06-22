/**
 * Renders one or more Schema.org objects as a `<script type="application/ld+json">`.
 * Server component (no client JS). `<` is escaped to avoid markup breakout.
 */
type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
