import { messages, type Locale } from "@repo/i18n";
import { cacheLife } from "next/cache";

import { APP_NAME } from "@/constants/ui";

function interpolateAppName(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = value.replace(/\{appName\}/g, APP_NAME);
    } else if (typeof value === "object" && value !== null) {
      result[key] = interpolateAppName(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export async function getCachedMessages(locale: Locale) {
  "use cache";
  cacheLife("days");

  const localeMessages = messages[locale] ?? messages.en;
  return interpolateAppName(localeMessages as unknown as Record<string, unknown>);
}
