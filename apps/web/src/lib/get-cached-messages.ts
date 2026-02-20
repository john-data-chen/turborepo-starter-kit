import { messages, type Locale } from "@repo/i18n";
import { cacheLife } from "next/cache";

export async function getCachedMessages(locale: Locale) {
  "use cache";
  cacheLife("days");

  return messages[locale] ?? messages.en;
}
