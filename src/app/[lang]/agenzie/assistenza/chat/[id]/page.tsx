import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { requireRole } from "@/lib/account/session";
import { SupportChatScreen } from "@/components/account/support/SupportChatScreen";

type Params = { lang: string; id: string };

/** Agency full-screen support chat (`/[lang]/agenzie/assistenza/chat/[id]`). */
export default async function AgencySupportChatPage({ params }: { params: Promise<Params> }) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const guard = await requireRole("agency", lang);
  if ("redirectTo" in guard) redirect(guard.redirectTo);

  return <SupportChatScreen audience="agency" threadId={id} basePath={`/${lang}/agenzie/assistenza`} />;
}
