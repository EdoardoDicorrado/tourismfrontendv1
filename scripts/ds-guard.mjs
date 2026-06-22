#!/usr/bin/env node
/**
 * Design System guard — fails when UI code re-introduces a divergence the
 * primitives/tokens are meant to prevent. Zero dependencies (pure Node).
 *
 * Rules (scanned in src, files .ts and .tsx):
 *   hex      — hardcoded `#rgb`/`#rgba`/`#rrggbb`/`#rrggbbaa` colors → token.
 *   radius   — arbitrary `rounded-[…]` (px/rem/%) → rounded-badge/card/panel/sheet.
 *   fontsize — arbitrary `text-[Npx]` → the type scale (text-2xs/xs/sm/… / a token).
 *   shadow   — arbitrary `shadow-[…]` → shadow-card/popover/sheet.
 *   zindex   — arbitrary `z-[…]` not using a `var(--z-*)` token.
 *   spacing  — arbitrary `p/m/gap/space-[…]` (excludes var()/env()/calc()/min()/max()).
 *   sizing   — arbitrary `w/h/min-/max-/size-[…]` (same exclusions).
 *   colorfn  — inline `color-mix()/rgb()/rgba()/hsl()/oklch()/oklab()` → token in globals.css.
 *   inlcolor — `style={{ color|background|boxShadow|fill|stroke: … }}` → tokens/utilities.
 *   legacy   — `hover:bg-cta/90` etc. → the Button primitive / state tokens.
 *
 * Baseline / ratchet:
 *   A pre-existing backlog is grandfathered in `scripts/ds-guard.baseline.json`
 *   (keyed by file + rule + normalized line text, NOT line number, so it survives
 *   reflows). A normal run reports ONLY violations absent from the baseline →
 *   the CI gate can block NEW drift today without first clearing the backlog.
 *     node scripts/ds-guard.mjs                  → exit 1 only on NEW violations
 *     node scripts/ds-guard.mjs --all            → report everything (ignore baseline)
 *     node scripts/ds-guard.mjs --update-baseline→ snapshot current state (shrink-only intent)
 *
 * Allowances:
 *   - `src/app/globals.css` is the home of tokens → skipped.
 *   - Per-line opt-out: trailing `// ds-guard-ignore` (or `ds-guard-ignore-next-line`
 *     on the previous line) when a raw value is genuinely justified.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const BASELINE_FILE = join(ROOT, "scripts", "ds-guard.baseline.json");
const SKIP_FILES = new Set([join("src", "app", "globals.css")]);

const args = new Set(process.argv.slice(2));
const UPDATE = args.has("--update-baseline");
const IGNORE_BASELINE = args.has("--all");

// Bracket contents that are legitimately dynamic (responsive math / safe-area /
// token refs) — not a hardcoded magic number, so spacing/sizing skip them.
const DYN = "(?!var\\(|env\\(|calc\\(|min\\(|max\\(|clamp\\()";

const RULES = [
  {
    id: "hex",
    re: /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b/,
    msg: "hex hardcoded → usa un token (globals.css) / utility (bg-*, text-*)",
  },
  {
    id: "radius",
    re: /rounded-(?:[trbl]{1,2}-|[a-z]+-)?\[(?!var\()[^\]]+\]/,
    msg: "raggio arbitrario → usa rounded-badge/card/panel/sheet",
  },
  {
    id: "fontsize",
    re: /\btext-\[\d+(?:\.\d+)?(?:px|rem|em)\]/,
    msg: "font-size arbitrario → usa la type scale (text-2xs/xs/sm/…) o un token",
  },
  {
    id: "shadow",
    re: /\bshadow-\[(?!var\()[^\]]+\]/,
    msg: "ombra arbitraria → usa shadow-card/popover/sheet",
  },
  {
    id: "zindex",
    re: /\bz-\[(?!var\()[^\]]+\]/,
    // NB: nel testo niente classe arbitraria con parentesi quadre (forma z + bracket)
    // — Tailwind 4 scansiona anche questo .mjs e la emette come CSS, rompendo il build.
    msg: "z-index arbitrario → usa un token var(--z-NOME) (scala in globals.css)",
  },
  {
    id: "spacing",
    re: new RegExp(`\\b(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy])-\\[${DYN}[^\\]]+\\]`),
    msg: "spacing arbitrario → usa la scala (p-4, gap-2…) o un token; var()/env()/calc() sono ok",
  },
  {
    id: "sizing",
    re: new RegExp(`\\b(?:w|h|min-w|max-w|min-h|max-h|size)-\\[${DYN}[^\\]]+\\]`),
    msg: "sizing arbitrario → usa la scala o un token; var()/env()/calc() sono ok",
  },
  {
    id: "colorfn",
    re: /(?:color-mix|rgba?|hsla?|oklch|oklab)\(/,
    msg: "color function inline → promuovila a token in globals.css (es. --color-cta-hover)",
  },
  {
    id: "inlcolor",
    re: /style=\{\{[^}]*(?:backgroundColor|background|borderColor|boxShadow|fill|stroke|(?<![a-zA-Z])color)\s*:/,
    msg: "colore inline in style={{}} → usa un token/utility (i colori dinamici vanno tokenizzati)",
  },
  {
    id: "legacy",
    re: /(?:hover|focus|active):bg-(?:cta|badge|ink)\/\d{2}\b/,
    msg: "stato hover/focus legacy (/90 ecc.) → usa la primitiva Button o i token *-hover",
  },
];

/** Collect .ts/.tsx files under src. */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

/** Stable key: file + rule + normalized text (NO line number → survives reflow). */
const keyOf = (v) => `${v.rel}|${v.rule}|${v.text.replace(/\s+/g, " ").trim()}`;

const violations = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll("\\", "/"); // ponytail: normalizza sep → baseline portabile Windows/CI Linux
  if (SKIP_FILES.has(rel)) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.includes("ds-guard-ignore")) return;
    if (i > 0 && lines[i - 1].includes("ds-guard-ignore-next-line")) return;
    for (const rule of RULES) {
      if (rule.re.test(line)) {
        violations.push({ rel, line: i + 1, rule: rule.id, msg: rule.msg, text: line.trim() });
      }
    }
  });
}

// --- baseline snapshot mode ---
if (UPDATE) {
  const keys = [...new Set(violations.map(keyOf))].sort();
  writeFileSync(BASELINE_FILE, JSON.stringify(keys, null, 2) + "\n");
  console.log(`✓ ds-guard: baseline aggiornata — ${keys.length} divergenze grandfathered → ${relative(ROOT, BASELINE_FILE)}`);
  process.exit(0);
}

const baseline = !IGNORE_BASELINE && existsSync(BASELINE_FILE)
  ? new Set(JSON.parse(readFileSync(BASELINE_FILE, "utf8")))
  : new Set();

const fresh = violations.filter((v) => !baseline.has(keyOf(v)));
const grandfathered = violations.length - fresh.length;

if (fresh.length === 0) {
  const note = baseline.size ? ` (${grandfathered} grandfathered nel baseline)` : "";
  console.log(`✓ ds-guard: nessuna NUOVA divergenza${note}.`);
  process.exit(0);
}

console.error(`✗ ds-guard: ${fresh.length} NUOVE divergenze (${grandfathered} grandfathered):\n`);
for (const v of fresh) {
  console.error(`  ${v.rel}:${v.line}  [${v.rule}] ${v.msg}`);
  console.error(`     ${v.text.slice(0, 120)}`);
}
console.error(
  "\nUsa un token/primitiva. Se il valore grezzo è davvero giustificato, aggiungi `// ds-guard-ignore` a fine riga.",
);
process.exit(1);
