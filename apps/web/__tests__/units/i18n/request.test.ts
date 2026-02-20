import { describe, expect, it, vi } from "vitest";

// Mock next-intl before importing the module
vi.mock("next-intl", () => ({
  hasLocale: vi.fn((locales, locale) => locales.includes(locale))
}));

vi.mock("next-intl/server", () => ({
  getRequestConfig: vi.fn((fn) => fn)
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en", "zh"],
    defaultLocale: "en"
  }
}));

// Mock @repo/i18n package
vi.mock("@repo/i18n", () => ({
  locales: ["en", "de"],
  defaultLocale: "en",
  messages: {
    en: { welcome: "Welcome", login: { title: "{appName}" } },
    de: { welcome: "Willkommen", login: { title: "{appName}" } }
  }
}));

describe("i18n request config", () => {
  it("should export getRequestConfig", async () => {
    const requestModule = await import("@/i18n/request");
    expect(requestModule.default).toBeDefined();
    expect(typeof requestModule.default).toBe("function");
  });

  it("should handle valid locale", async () => {
    const requestModule = await import("@/i18n/request");
    const config = await requestModule.default({ requestLocale: Promise.resolve("en") });

    expect(config.locale).toBe("en");
    expect(config.messages).toBeDefined();
  });

  it("should fallback to default locale for invalid locale", async () => {
    const requestModule = await import("@/i18n/request");
    const config = await requestModule.default({ requestLocale: Promise.resolve("fr") });

    expect(config.locale).toBe("en");
    expect(config.messages).toBeDefined();
  });

  it("should load correct messages for locale", async () => {
    const requestModule = await import("@/i18n/request");
    const config = await requestModule.default({ requestLocale: Promise.resolve("en") });

    expect(config.messages).toBeDefined();
    expect(config.messages!.welcome).toBe("Welcome");
  });
});
