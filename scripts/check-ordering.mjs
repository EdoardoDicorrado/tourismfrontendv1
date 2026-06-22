// Runnable self-check for the catalog seams: ordering (`byPosition`) and the
// booking ≥2-slots demo guarantee (`ensureMinSlots`).
// No test runner in the repo → plain Node asserts. Node 24 strips the TS types
// on import. Run: `node scripts/check-ordering.mjs` (exits non-zero on failure).
import assert from "node:assert/strict";
import { byPosition } from "../src/lib/catalog/ordering.ts";
import { ensureMinSlots, MIN_SLOTS } from "../src/lib/booking/slots.ts";

// Sorts by position ascending.
assert.deepEqual(
  byPosition([{ id: "b", position: 2 }, { id: "a", position: 1 }]).map((x) => x.id),
  ["a", "b"],
);

// Unpositioned items go last, keeping their incoming order (stable).
assert.deepEqual(
  byPosition([
    { id: "x" },
    { id: "p1", position: 1 },
    { id: "y" },
    { id: "p0", position: 0 },
  ]).map((x) => x.id),
  ["p0", "p1", "x", "y"],
);

// Equal positions keep incoming order (stable); does not mutate the input.
const input = [{ id: "a", position: 5 }, { id: "b", position: 5 }];
assert.deepEqual(byPosition(input).map((x) => x.id), ["a", "b"]);
assert.deepEqual(input.map((x) => x.id), ["a", "b"]);

// null position treated as unpositioned.
assert.deepEqual(
  byPosition([{ id: "n", position: null }, { id: "z", position: 9 }]).map((x) => x.id),
  ["z", "n"],
);

// --- ensureMinSlots: every option keeps ≥ MIN_SLOTS bookable times ---

// Already enough → returned untouched.
const enough = [{ time: "10:00" }, { time: "12:00" }, { time: "14:00" }];
assert.equal(ensureMinSlots(enough), enough);

// Thin day padded up to MIN_SLOTS with demo times, original kept first.
const padded = ensureMinSlots([{ time: "10:00" }]);
assert.ok(padded.filter((s) => !s.soldOut).length >= MIN_SLOTS);
assert.equal(padded[0].time, "10:00");

// Empty day padded to MIN_SLOTS, no duplicate times.
const fromEmpty = ensureMinSlots([]);
assert.ok(fromEmpty.length >= MIN_SLOTS);
assert.equal(new Set(fromEmpty.map((s) => s.time)).size, fromEmpty.length);

// Sold-out slots don't count toward the minimum → still padded to ≥ MIN_SLOTS bookable.
const withSoldOut = ensureMinSlots([{ time: "10:00", soldOut: true }]);
assert.ok(withSoldOut.filter((s) => !s.soldOut).length >= MIN_SLOTS);

console.log("ordering + slots checks OK");
