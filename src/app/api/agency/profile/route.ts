import { NextResponse, type NextRequest } from "next/server";

import { getAgencyProfile, updateAgencyProfile } from "@/lib/account/client";
import { getSession } from "@/lib/account/session";
import type { AgencyProfilePatch } from "@/lib/account/types";
import { isEmail } from "@/lib/validation";

/**
 * Agency profile BFF — read / update the logged-in agency's profile.
 *
 * GET returns the current profile; PATCH applies the editable fields only
 * (read-only company flags — commission_percent / api_enabled / is_active, plus
 * id/code — are dropped server-side here so they can never be tampered with).
 *
 * Auth: the agency session is read from the httpOnly cookie via `getSession()`;
 * its bearer token is forwarded to `@/lib/account/client`, which proxies to the
 * backend (single writer) with the mandatory `Idempotency-Key`.
 */

export const dynamic = "force-dynamic";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Editable agency user fields (read-only flags are never accepted). */
function pickUser(raw: Record<string, unknown>): AgencyProfilePatch["user"] {
  const out: NonNullable<AgencyProfilePatch["user"]> = {};
  for (const key of ["name", "email", "phone", "locale"] as const) {
    const v = asString(raw[key]);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

/** Editable company fields. Read-only flags (commission/active/api/id/code) are excluded. */
function pickAgency(raw: Record<string, unknown>): AgencyProfilePatch["agency"] {
  const out: NonNullable<AgencyProfilePatch["agency"]> = {};
  for (const key of [
    "legal_name",
    "display_name",
    "address_street",
    "address_street_number",
    "postal_code",
    "city",
    "country_alpha2",
    "municipality_code",
    "phone_prefix",
    "phone",
    "fax",
    "email",
    "website",
    "description",
    "collaboration_reason",
  ] as const) {
    const v = asString(raw[key]);
    if (v !== undefined) out[key] = v;
  }
  // Nullable URL fields: accept string or explicit null.
  for (const key of ["facebook_url", "twitter_url", "tripadvisor_url"] as const) {
    if (key in raw) {
      const v = raw[key];
      if (v === null) out[key] = null;
      else if (typeof v === "string") out[key] = v;
    }
  }
  return out;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "agency") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const profile = await getAgencyProfile(session.token);
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ ok: false, error: "profile_failed" }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "agency") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as { user?: unknown; agency?: unknown };
  const patch: AgencyProfilePatch = {
    user: pickUser((data.user ?? {}) as Record<string, unknown>),
    agency: pickAgency((data.agency ?? {}) as Record<string, unknown>),
  };

  // Validate the contact email if it was provided.
  const email = patch.user?.email;
  if (typeof email === "string" && !isEmail(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  try {
    const profile = await updateAgencyProfile(patch, session.token);
    return NextResponse.json({ ok: true, profile });
  } catch {
    return NextResponse.json({ ok: false, error: "profile_failed" }, { status: 502 });
  }
}
