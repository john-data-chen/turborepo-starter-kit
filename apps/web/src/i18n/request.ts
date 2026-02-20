import { type Locale, locales, defaultLocale } from "@repo/i18n";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { getCachedMessages } from "@/lib/get-cached-messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? (requested) : defaultLocale;

  return {
    locale,
    messages: await getCachedMessages(locale)
  };
});
