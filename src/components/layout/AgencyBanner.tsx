import { getSession } from "@/lib/account/session";

/**
 * Site-wide strip shown ABOVE the header for a signed-in agency: it reminds the
 * partner that the agency discount is active while they browse the storefront
 * like a normal user. Server component — reads the httpOnly session cookie, so it
 * renders nothing for customers / logged-out visitors.
 */
export async function AgencyBanner({ label }: { label: string }) {
  const session = await getSession();
  if (session?.role !== "agency") return null;

  return (
    <div className="bg-cta px-4 py-2 text-center text-sm font-bold text-white">{label}</div>
  );
}
