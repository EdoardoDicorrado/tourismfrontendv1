import { NextResponse, type NextRequest } from "next/server";

/**
 * Careers application BFF — receives a "Lavora con noi" job application.
 *
 * ARCHITECTURE (CLAUDE.md): the tatanka3 backend is the single writer. This route
 * is a thin proxy that validates the payload server-side and would forward it to
 * the backend, keeping any tokens off the client. It must NEVER persist anything
 * itself (no DB, no dual-write).
 *
 * The public storefront careers API is not defined yet, so submission is mocked
 * behind `submitApplication()`. When the endpoint lands, swap the stub body for a
 * `backendFetch({ path: "/api/storefront/careers/applications", method: "POST",
 * body, locale })` call (multipart) and return the backend-issued reference.
 */

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB — mirrors the CV hint in the UI
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = /\.(pdf|docx?|DOCX?)$/i;

const REQUIRED_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "birth_date",
  "residence_address",
] as const;

function isNonEmpty(value: FormDataEntryValue | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** A valid uploaded file: non-empty, allowed type/extension, within the size cap. */
function isValidUpload(value: FormDataEntryValue | null): value is File {
  if (!(value instanceof File) || value.size === 0) return false;
  if (value.size > MAX_FILE_BYTES) return false;
  return ALLOWED_TYPES.has(value.type) || ALLOWED_EXT.test(value.name);
}

/** Placeholder application reference. The real reference will be issued by the backend. */
function makeReference(): string {
  // Runtime-only (request handler) — Date/random are fine here, unlike in SSR/render.
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `TM-JOB-${time}-${rand}`;
}

async function submitApplication(_form: FormData): Promise<{ reference: string }> {
  // TODO(storefront-api): replace with a proxied multipart POST to the backend
  // (single writer): the CV/cover-letter Files and the applicant fields forwarded
  // as-is, returning the backend-issued reference.
  return { reference: makeReference() };
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_form" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (!isNonEmpty(form.get(field))) {
      return NextResponse.json({ ok: false, error: `missing_${field}` }, { status: 422 });
    }
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((form.get("email") as string).trim())) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }
  if (form.get("gdpr_consent") !== "true") {
    return NextResponse.json({ ok: false, error: "missing_consent" }, { status: 422 });
  }

  const cv = form.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ ok: false, error: "missing_cv" }, { status: 422 });
  }
  if (!isValidUpload(cv)) {
    return NextResponse.json({ ok: false, error: "invalid_cv" }, { status: 422 });
  }
  const cover = form.get("cover_letter");
  if (cover instanceof File && cover.size > 0 && !isValidUpload(cover)) {
    return NextResponse.json({ ok: false, error: "invalid_cover_letter" }, { status: 422 });
  }

  try {
    const result = await submitApplication(form);
    return NextResponse.json({ ok: true, reference: result.reference });
  } catch {
    return NextResponse.json({ ok: false, error: "submit_failed" }, { status: 502 });
  }
}
