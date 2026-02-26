import { describe, it, expect, vi } from "vitest";

import { loadLanguagePreference, saveLanguagePreference } from "@/lib/language";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
}));

describe("i18n language preference", () => {
  it("should save and load language preference", async () => {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    vi.mocked(AsyncStorage.setItem).mockResolvedValue(undefined);
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("de");

    await saveLanguagePreference("de");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("language-preference", "de");

    const lang = await loadLanguagePreference();
    expect(lang).toBe("de");
  });

  it("should return null when no preference saved", async () => {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);

    const lang = await loadLanguagePreference();
    expect(lang).toBeNull();
  });
});
