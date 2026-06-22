#!/usr/bin/env node
/**
 * Self-test del DS guard. Zero dipendenze (node:assert + spawn).
 *
 * Nasce dal bug #32/#45: `scripts/ds-guard.mjs` aveva nel messaggio di una regola
 * il literal di una classe z-index arbitraria il cui valore var conteneva un asterisco.
 * Tailwind 4 auto-scansiona anche i `.mjs`, lo estrae come classe e genera un valore
 * z-index con un Delim CSS asterisco invalido → parse-fail di Turbopack su globals.css
 * (vittima: l'output generato, non il sorgente). ds-guard NON si auto-scansiona (guarda
 * solo `src/`, non `scripts/`), quindi serve questo guardiano-del-guardiano.
 * NB: in questo file NON si scrive l'esempio in forma estraibile (classe arbitraria
 * col bracket), altrimenti Tailwind lo ri-emetterebbe rotto da QUI. Eseguito da `pnpm test`.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Firma del landmine: una classe utility con valore arbitrario che contiene `*`
// → CSS invalido che rompe il build quando Tailwind lo emette. (Esempio NON scritto
// qui in forma estraibile col bracket, per non re-introdurre il landmine in questo file.)
const INVALID_ARBITRARY = /[a-z][\w-]*-\[[^\]]*\*[^\]]*\]/g;

function scan(relPath) {
  const text = readFileSync(new URL(relPath, import.meta.url), "utf8");
  return text.match(INVALID_ARBITRARY) || [];
}

// 1. Il guard stesso non deve contenere il landmine nei suoi msg/commenti.
assert.deepEqual(
  scan("./ds-guard.mjs"),
  [],
  "ds-guard.mjs contiene una classe arbitraria invalida (Tailwind la emette rotta) — vedi bug #32",
);

// 2. globals.css (output emesso = vittima) non deve avere la firma nei token/commenti.
assert.deepEqual(
  scan("../src/app/globals.css"),
  [],
  "globals.css contiene una classe arbitraria invalida con `*`",
);

// 3. Il gate scatta davvero: con baseline → exit 0; con --all (tutto il backlog) → exit != 0.
const run = (args) => {
  try {
    execFileSync(process.execPath, ["scripts/ds-guard.mjs", ...args], { cwd: ROOT, stdio: "pipe" });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
};
assert.equal(run([]), 0, "ds:check con baseline deve passare (0 nuove divergenze)");
assert.notEqual(run(["--all"]), 0, "ds:check --all deve FALLIRE (il backlog esiste) — il gate deve poter bloccare");

console.log("ds-guard self-test OK");
