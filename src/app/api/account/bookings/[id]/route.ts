import { NextResponse, type NextRequest } from "next/server";

import { updateBooking } from "@/lib/account/client";
import { getSession } from "@/lib/account/session";
import { BackendError } from "@/lib/api/client";
import type {
  BookingDropoff,
  BookingHotel,
  BookingParticipantPatch,
  BookingPatch,
  BookingPickup,
} from "@/lib/account/types";

/**
 * Booking update BFF (`PATCH /api/account/bookings/{id}`).
 *
 * ARCHITECTURE (CLAUDE.md): tatanka3 is the single writer. This route validates
 * the payload shape server-side, enforces the session scope (a customer may only
 * touch their own booking; an agency only its agency's — the bearer token also
 * enforces this upstream), and proxies the patch to the account seam.
 *
 * The seam forwards the session bearer token (kept in the httpOnly cookie) plus a
 * mandatory `Idempotency-Key`. EDITABILITY IS ENFORCED BY THE BACKEND: a booking
 * that can no longer be edited comes back as `403 booking_not_editable`, which we
 * surface here as `not_editable` — we no longer pre-check travelled/cancelled flags.
 */

export const dynamic = "force-dynamic";

/** Read a possibly-present string field (kept as-is; trimming is the backend's call). */
function optString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optBool(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

/** Build the participant patches: each entry must carry an `id`; only known fields pass through. */
function parseParticipants(raw: unknown): BookingParticipantPatch[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: BookingParticipantPatch[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.id !== "string" || e.id.trim() === "") continue;
    const patch: BookingParticipantPatch = { id: e.id };
    for (const key of [
      "first_name",
      "last_name",
      "email",
      "phone_prefix",
      "phone",
      "birth_date",
      "passport",
      "identity_document",
      "nationality",
    ] as const) {
      const v = optString(e[key]);
      if (v !== undefined) patch[key] = v;
    }
    out.push(patch);
  }
  return out.length > 0 ? out : undefined;
}

const HOTEL_FIELDS = [
  "hotel_name",
  "hotel_street_address",
  "hotel_street_number",
  "hotel_city",
  "hotel_postal_code",
  "booking_name_at_hotel",
  "room_number",
  "front_desk_phone",
  "front_desk_language",
] as const;

function parseHotel(raw: unknown): Partial<BookingHotel> | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  const hotel: Partial<BookingHotel> = {};
  for (const key of HOTEL_FIELDS) {
    const v = optString(r[key]);
    if (v !== undefined) hotel[key] = v;
  }
  // An all-empty hotel object (untouched form section) means "no hotel change":
  // forwarding it would make the backend write NULLs into NOT NULL columns.
  if (HOTEL_FIELDS.every((key) => !hotel[key] || hotel[key].trim() === "")) return undefined;
  return Object.keys(hotel).length > 0 ? hotel : undefined;
}

/**
 * `reservation_hotel_details` has NOT NULL columns (`hotel_name`, `hotel_city`,
 * `booking_name_at_hotel`) that the backend does not validate (it 500s on the DB
 * constraint instead), so a partially-filled hotel patch is rejected here.
 */
function hotelMissingRequired(hotel: Partial<BookingHotel>): boolean {
  return (
    !hotel.hotel_name?.trim() || !hotel.hotel_city?.trim() || !hotel.booking_name_at_hotel?.trim()
  );
}

function parsePickup(raw: unknown): Partial<BookingPickup> | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  const pickup: Partial<BookingPickup> = {};
  const requested = optBool(r.pickup_requested);
  if (requested !== undefined) pickup.pickup_requested = requested;
  const locationId = optString(r.pickup_location_id);
  if (locationId !== undefined) pickup.pickup_location_id = locationId;
  const notes = optString(r.pickup_notes);
  if (notes !== undefined) pickup.pickup_notes = notes;
  return Object.keys(pickup).length > 0 ? pickup : undefined;
}

function parseDropoff(raw: unknown): Partial<BookingDropoff> | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const r = raw as Record<string, unknown>;
  const dropoff: Partial<BookingDropoff> = {};
  const requested = optBool(r.dropoff_requested);
  if (requested !== undefined) dropoff.dropoff_requested = requested;
  const locationId = optString(r.dropoff_location_id);
  if (locationId !== undefined) dropoff.dropoff_location_id = locationId;
  const notes = optString(r.dropoff_notes);
  if (notes !== undefined) dropoff.dropoff_notes = notes;
  return Object.keys(dropoff).length > 0 ? dropoff : undefined;
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  // Gate: must be authenticated. Booking ownership is enforced by the backend
  // (the user-scoped token only resolves the user's own reservations → 404).
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const data = (body ?? {}) as {
    participants?: unknown;
    hotel?: unknown;
    pickup?: unknown;
    dropoff?: unknown;
  };

  const hotel = parseHotel(data.hotel);
  if (hotel && hotelMissingRequired(hotel)) {
    return NextResponse.json({ ok: false, error: "hotel_incomplete" }, { status: 400 });
  }

  const patch: BookingPatch = {
    participants: parseParticipants(data.participants),
    hotel,
    pickup: parsePickup(data.pickup),
    dropoff: parseDropoff(data.dropoff),
  };

  try {
    const updated = await updateBooking(id, patch, session.token);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, booking: updated });
  } catch (err) {
    // The backend owns the editability rule: 403 booking_not_editable.
    if (err instanceof BackendError && err.status === 403) {
      return NextResponse.json({ ok: false, error: "not_editable" }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "update_failed" }, { status: 502 });
  }
}
