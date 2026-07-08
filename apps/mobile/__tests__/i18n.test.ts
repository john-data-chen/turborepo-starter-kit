import { describe, it, expect, vi } from "vitest";

vi.mock("expo-localization", () => ({
  getLocales: () => [{ languageCode: "en" }]
}));

import { i18n, locales, defaultLocale } from "@/lib/i18n";

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
