import { describe, it, expect, vi } from "vitest";

import { i18n, locales, defaultLocale } from "@/lib/i18n";

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }]
}));

describe("i18n config", () => {
  it("should have correct locales", () => {
    expect(locales).toContain("en");
    expect(locales).toContain("de");
    expect(defaultLocale).toBe("en");
  });

  it("should initialize i18next", () => {
    expect(i18n.isInitialized).toBe(true);
  });
});
