import { ErrorBoundaryProps } from "expo-router";
import { useTranslation } from "react-i18next";

import { View, Text, Pressable } from "@/lib/tw";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
      <Text className="text-xl font-bold text-foreground">{t("error.title")}</Text>
      <Text className="text-center text-muted-foreground">
        {error.message || t("error.workspaceError")}
      </Text>
      <Pressable onPress={retry} className="rounded-lg bg-primary px-6 py-3">
        <Text className="font-semibold text-primary-foreground">{t("error.tryAgain")}</Text>
      </Pressable>
    </View>
  );
}
