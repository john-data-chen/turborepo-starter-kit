import de from "./locales/de.json";
import en from "./locales/en.json";

export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const messages = { en, de } as const;

export type Messages = typeof en;

export { en, de };
