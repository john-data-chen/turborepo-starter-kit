import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

const THEME_KEY = "theme-preference";

export async function loadThemePreference(): Promise<ThemePreference> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "dark";
}

export async function saveThemePreference(pref: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, pref);
}

export function applyThemePreference(pref: ThemePreference): void {
  Appearance.setColorScheme(pref === "system" ? null : pref);
}
