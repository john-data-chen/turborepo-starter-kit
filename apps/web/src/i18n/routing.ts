import { locales, defaultLocale } from "@repo/i18n";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales,
  defaultLocale
});
