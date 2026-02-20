import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { i18n } from "@/lib/i18n";
import { View, Text, ScrollView, Pressable } from "@/lib/tw";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const currentLang = i18n.language;
  const { logout, user } = useAuth();

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "de" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 gap-6"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">{t("user.logOut")}</Text>
        <Pressable
          className="flex-row items-center gap-4 rounded-lg bg-card p-4"
          style={{ borderCurve: "continuous" }}
          onPress={logout}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Text className="font-bold text-muted-foreground">
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-medium text-foreground">{user?.name}</Text>
            <Text className="text-sm text-muted-foreground">{user?.email}</Text>
          </View>
          <Text className="font-semibold text-destructive">{t("user.logOut")}</Text>
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">Language</Text>
        <Pressable
          className="rounded-lg bg-card p-4"
          style={{ borderCurve: "continuous" }}
          onPress={toggleLanguage}
        >
          <Text className="text-foreground">
            {currentLang === "en" ? "English → Deutsch" : "Deutsch → English"}
          </Text>
        </Pressable>
      </View>

      <View className="gap-2">
        <Text className="text-lg font-semibold text-foreground">{t("theme.toggleTheme")}</Text>
        <Text className="text-muted-foreground">Current: {colorScheme ?? "system"}</Text>
      </View>
    </ScrollView>
  );
}
