import { NextResponse, type NextRequest } from "next/server";

import { agencySignup } from "@/lib/account/client";
import { BackendError } from "@/lib/api/client";
import type { AgencySignupPayload } from "@/lib/account/types";
import { isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Agency signup BFF (`POST /api/auth/agency/signup`).
 *
 * Validates the registration payload server-side, then asks the account-client
 * seam to create the (inactive) agency awaiting admin activation. NO session is
 * created here — the agency must be activated by staff before it can log in, so
 * the response is just `{ ok: true, status: "pending_activation" }`.
 *
 * Shape mirrors the backend 1:1 (nested English): `agency.{legal_name, …,
 * billing:{vat_id, …}}` + `user.{name, email, …}`. Only `agency.legal_name`,
 * `user.{name,email,email_confirm,password,password_confirm,policy_check}` are
 * required (the rest are nullable upstream). A backend `422` (duplicate email,
 * password complexity, bad country/municipality code) is surfaced as
 * `validation_failed` with the field `details` so the form can map them.
 */

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nullableString(value: unknown): string | null {
  return isNonEmptyString(value) ? value : null;
}

/** Optional billing sub-object — only included when at least one field is present. */
function buildBilling(raw: Record<string, unknown>): AgencySignupPayload["agency"]["billing"] {
  const billing: NonNullable<AgencySignupPayload["agency"]["billing"]> = {};
  for (const key of [
    "vat_id",
    "tax_code",
    "identity_document_type",
    "identity_document_number",
    "identity_document_country_alpha2",
  ] as const) {
    const v = nullableString(raw[key]);
    if (v !== null) billing[key] = v;
  }
  return Object.keys(billing).length > 0 ? billing : undefined;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as {
    agency?: Record<string, unknown>;
    user?: Record<string, unknown>;
    locale?: unknown;
  };
  const agency = data.agency ?? {};
  const user = data.user ?? {};
  const billing = (agency.billing ?? {}) as Record<string, unknown>;
  const locale: Locale | undefined =
    typeof data.locale === "string" && isLocale(data.locale) ? data.locale : undefined;

  // ── Required fields (everything else is nullable upstream) ──
  if (!isNonEmptyString(agency.legal_name)) {
    return NextResponse.json({ ok: false, error: "missing_legal_name" }, { status: 422 });
  }
  if (!isNonEmptyString(user.name)) {
    return NextResponse.json({ ok: false, error: "missing_name" }, { status: 422 });
  }
  for (const field of ["email", "email_confirm", "password", "password_confirm"] as const) {
    if (!isNonEmptyString(user[field])) {
      return NextResponse.json({ ok: false, error: `missing_${field}` }, { status: 422 });
    }
  }
  if (!EMAIL_RE.test(user.email as string)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }
  if (user.email !== user.email_confirm) {
    return NextResponse.json({ ok: false, error: "email_mismatch" }, { status: 422 });
  }
  if ((user.password as string).length < 8) {
    return NextResponse.json({ ok: false, error: "weak_password" }, { status: 422 });
  }
  if (user.password !== user.password_confirm) {
    return NextResponse.json({ ok: false, error: "password_mismatch" }, { status: 422 });
  }
  if (user.policy_check !== true) {
    return NextResponse.json({ ok: false, error: "policy_required" }, { status: 422 });
  }

  const userLocaleRaw = typeof user.locale === "string" ? user.locale : undefined;
  const userLocale = isLocale(userLocaleRaw) ? userLocaleRaw : (locale ?? null);

  const payload: AgencySignupPayload = {
    agency: {
      legal_name: agency.legal_name,
      display_name: nullableString(agency.display_name),
      code: nullableString(agency.code),
      address_street: nullableString(agency.address_street),
      address_street_number: nullableString(agency.address_street_number),
      postal_code: nullableString(agency.postal_code),
      city: nullableString(agency.city),
      country_alpha2: nullableString(agency.country_alpha2),
      municipality_code: nullableString(agency.municipality_code),
      email: nullableString(agency.email),
      phone_prefix: nullableString(agency.phone_prefix),
      phone: nullableString(agency.phone),
      website: nullableString(agency.website),
      facebook_url: nullableString(agency.facebook_url),
      tripadvisor_url: nullableString(agency.tripadvisor_url),
      collaboration_reason: nullableString(agency.collaboration_reason),
      billing: buildBilling(billing),
    },
    user: {
      name: user.name,
      email: user.email as string,
      email_confirm: user.email_confirm as string,
      password: user.password as string,
      password_confirm: user.password_confirm as string,
      locale: userLocale,
      policy_check: true,
    },
  };

  try {
    const result = await agencySignup(payload, locale);
    return NextResponse.json({ ok: true, status: result.status });
  } catch (err) {
    if (err instanceof BackendError && err.status === 422) {
      const details =
        err.body && typeof err.body === "object" && "error" in err.body
          ? (err.body as { error?: { details?: unknown } }).error?.details
          : undefined;
      return NextResponse.json(
        { ok: false, error: "validation_failed", details },
        { status: 422 },
      );
    }
    return NextResponse.json({ ok: false, error: "signup_failed" }, { status: 502 });
  }
}
