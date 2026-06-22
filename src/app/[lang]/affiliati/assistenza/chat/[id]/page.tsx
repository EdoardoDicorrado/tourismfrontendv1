import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { SupportChatScreen } from "@/components/account/support/SupportChatScreen";

type Params = { lang: string; id: string };

/** Affiliate full-screen support chat (`/[lang]/affiliati/assistenza/chat/[id]`). */
export default async function AffiliateSupportChatPage({ params }: { params: Promise<Params> }) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  return <SupportChatScreen audience="affiliate" threadId={id} basePath={`/${lang}/affiliati/assistenza`} />;
}
