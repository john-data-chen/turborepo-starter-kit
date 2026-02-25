import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { i18n } from "@/lib/i18n";
import { saveLanguagePreference } from "@/lib/language";
import {
  type ThemePreference,
  applyThemePreference,
  loadThemePreference,
  saveThemePreference
} from "@/lib/theme";
import { View, Text, ScrollView, Pressable } from "@/lib/tw";

const THEME_OPTIONS: ThemePreference[] = ["light", "dark", "system"];
const LANGUAGE_CODES = ["en", "de"] as const;
const LANGUAGE_LABELS = ["English", "Deutsch"];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { logout, user } = useAuth();

  const [themeIndex, setThemeIndex] = useState(2);
  const [langIndex, setLangIndex] = useState(i18n.language === "de" ? 1 : 0);

  useEffect(() => {
    loadThemePreference().then((pref) => {
      setThemeIndex(THEME_OPTIONS.indexOf(pref));
    });
  }, []);

  const handleThemeChange = useCallback((index: number) => {
    const pref = THEME_OPTIONS[index];
    setThemeIndex(index);
    applyThemePreference(pref);
    saveThemePreference(pref);
    if (process.env.EXPO_OS === "ios") {
      Haptics.selectionAsync();
    }
  }, []);

  const handleLanguageChange = useCallback((index: number) => {
    const lang = LANGUAGE_CODES[index];
    setLangIndex(index);
    i18n.changeLanguage(lang);
    saveLanguagePreference(lang);
    if (process.env.EXPO_OS === "ios") {
      Haptics.selectionAsync();
    }
  }, []);

  const themeLabels = [t("theme.light"), t("theme.dark"), t("theme.system")];
  const isDark = colorScheme === "dark";

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 gap-8"
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Account Section */}
      <View className="gap-3">
        <View className="gap-4 rounded-xl bg-card p-4" style={{ borderCurve: "continuous" }}>
          {/* User Info Row */}
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Text className="text-lg font-bold text-primary-foreground">
                {user?.email?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
            <View className="flex-1">
              <Text selectable className="text-base font-semibold text-foreground">
                {user?.name ?? user?.email?.split("@")[0]}
              </Text>
              <Text selectable className="text-sm text-muted-foreground">
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-border" />

          {/* Logout Button */}
          <Pressable onPress={logout} className="items-center rounded-lg py-2.5">
            <Text className="text-base font-medium text-destructive">{t("user.logOut")}</Text>
          </Pressable>
        </View>
      </View>

      {/* Language Section */}
      <View className="gap-3">
        <Text className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("settings.language", { defaultValue: "Language" })}
        </Text>
        <View className="gap-3 rounded-xl bg-card p-4" style={{ borderCurve: "continuous" }}>
          <SegmentedControl
            values={LANGUAGE_LABELS}
            selectedIndex={langIndex}
            onChange={(event) => {
              handleLanguageChange(event.nativeEvent.selectedSegmentIndex);
            }}
            appearance={isDark ? "dark" : "light"}
          />
        </View>
      </View>

      {/* Theme Section */}
      <View className="gap-3">
        <Text className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("theme.toggleTheme")}
        </Text>
        <View className="gap-3 rounded-xl bg-card p-4" style={{ borderCurve: "continuous" }}>
          <SegmentedControl
            values={themeLabels}
            selectedIndex={themeIndex}
            onChange={(event) => {
              handleThemeChange(event.nativeEvent.selectedSegmentIndex);
            }}
            appearance={isDark ? "dark" : "light"}
          />
        </View>
      </View>
    </ScrollView>
  );
}
