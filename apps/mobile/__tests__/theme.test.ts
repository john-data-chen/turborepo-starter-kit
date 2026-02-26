import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { loadThemePreference, saveThemePreference, applyThemePreference } from "@/lib/theme";

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn()
  }
}));

vi.mock("react-native", () => ({
  Appearance: {
    setColorScheme: vi.fn()
  }
}));

describe("theme utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load theme preference", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue("light");
    const pref = await loadThemePreference();
    expect(pref).toBe("light");
  });

  it("should return default dark if nothing stored", async () => {
    vi.mocked(AsyncStorage.getItem).mockResolvedValue(null);
    const pref = await loadThemePreference();
    expect(pref).toBe("dark");
  });

  it("should save theme preference", async () => {
    await saveThemePreference("system");
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("theme-preference", "system");
  });

  it("should apply theme preference", () => {
    applyThemePreference("light");
    expect(Appearance.setColorScheme).toHaveBeenCalledWith("light");
  });
});
