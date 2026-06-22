import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n/config";
import { SupportChatScreen } from "@/components/account/support/SupportChatScreen";

type Params = { lang: string; id: string };

/** Customer full-screen support chat (`/[lang]/supporto/chat/[id]`). */
export default async function SupportChatPage({ params }: { params: Promise<Params> }) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  return <SupportChatScreen audience="customer" threadId={id} basePath={`/${lang}/supporto`} />;
}
