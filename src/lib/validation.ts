/**
 * Shared request-validation guards for the BFF route handlers.
 *
 * These centralize the email shape and "non-empty string" checks that were
 * hand-copied across the `src/app/api/**` routes, so the validation rules can
 * never drift between endpoints. Pure module (no `server-only`) so it can be
 * reused by client forms too if needed.
 */

/** Loose email shape: `local@domain.tld`, no whitespace. Not RFC-complete by design. */
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** True when `value` looks like an email address. */
export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** True when `value` is a string with non-whitespace content. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
