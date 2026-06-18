#!/usr/bin/env node
/**
 * Design System guard — fails when UI code re-introduces a divergence the
 * primitives/tokens are meant to prevent. Zero dependencies (pure Node).
 *
 * Rules (scanned in src, files .ts and .tsx):
 *   1. hex     — hardcoded `#rgb`/`#rrggbb` colors (use a token in globals.css).
 *   2. radius  — arbitrary `rounded-[Npx]` (use rounded-badge/card/panel/sheet).
 *   3. colormix— inline `color-mix(` outside globals.css (promote to a token).
 *   4. legacy  — `hover:bg-cta/90` etc. (use the Button primitive / state tokens).
 *
 * Allowances:
 *   - `src/app/globals.css` is the home of tokens → skipped.
 *   - Per-line opt-out: add a trailing `// ds-guard-ignore` (or `ds-guard-ignore-next-line`
 *     on the previous line) when a raw value is genuinely justified.
 *
 * Usage: `node scripts/ds-guard.mjs` → exit 0 clean, exit 1 with a report.
 * (Reports only inside primitives are still violations — primitives derive from
 *  tokens too; the ONE allowed home for raw color math is globals.css.)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const SKIP_FILES = new Set([join("src", "app", "globals.css")]);

const RULES = [
  {
    id: "hex",
    // #rgb or #rrggbb in code (not in a // comment line). We flag any occurrence;
    // comments documenting a token are rare and can use ds-guard-ignore.
    re: /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/,
    msg: "hex hardcoded → usa un token (globals.css) / utility (bg-*, text-*)",
  },
  {
    id: "radius",
    re: /rounded-(?:[a-z]+-)?\[\d+px\]/,
    msg: "raggio arbitrario → usa rounded-badge/card/panel/sheet",
  },
  {
    id: "colormix",
    re: /color-mix\(/,
    msg: "color-mix inline → promuovilo a token in globals.css (es. --color-cta-hover)",
  },
  {
    id: "legacy",
    re: /hover:bg-(?:cta|badge|ink)\/\d{2}\b/,
    msg: "stato hover legacy (/90 ecc.) → usa la primitiva Button o i token *-hover",
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

const violations = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file);
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

if (violations.length === 0) {
  console.log("✓ ds-guard: nessuna divergenza trovata.");
  process.exit(0);
}

console.error(`✗ ds-guard: ${violations.length} divergenze (le primitive/token le evitano):\n`);
for (const v of violations) {
  console.error(`  ${v.rel}:${v.line}  [${v.rule}] ${v.msg}`);
  console.error(`     ${v.text.slice(0, 120)}`);
}
console.error(
  "\nSe un valore grezzo è davvero giustificato, aggiungi `// ds-guard-ignore` a fine riga.",
);
process.exit(1);
