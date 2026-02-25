import { messages, locales, defaultLocale } from "@repo/i18n";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { APP_NAME } from "@/constants/app";
import { loadLanguagePreference } from "@/lib/language";

const deviceLocale = getLocales()[0]?.languageCode ?? "en";
const resolvedLocale = locales.includes(deviceLocale as (typeof locales)[number])
  ? deviceLocale
  : defaultLocale;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: messages.en },
    de: { translation: messages.de }
  },
  lng: resolvedLocale,
  fallbackLng: defaultLocale,
  defaultNS: "translation",
  interpolation: {
    escapeValue: false,
    prefix: "{",
    suffix: "}",
    defaultVariables: { appName: APP_NAME }
  }
});

// Load persisted language preference (async, overrides device locale if set)
loadLanguagePreference().then((lang) => {
  if (lang && lang !== i18n.language) {
    i18n.changeLanguage(lang);
  }
});

export { i18n, locales, defaultLocale };
