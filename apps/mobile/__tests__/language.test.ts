import AsyncStorage from "@react-native-async-storage/async-storage";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { loadLanguagePreference, saveLanguagePreference } from "@/lib/language";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
}));

describe("language utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load language preference", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("en");
    const lang = await loadLanguagePreference();
    expect(lang).toBe("en");
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("language-preference");
  });

  it("should save language preference", async () => {
    await saveLanguagePreference("de");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("language-preference", "de");
  });
});
