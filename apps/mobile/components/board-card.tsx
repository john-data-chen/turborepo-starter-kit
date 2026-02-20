import type { Board } from "@repo/store";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import { View, Text, Pressable } from "@/lib/tw";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={`/boards/${board._id}`} asChild>
      <Pressable
        className="gap-2 rounded-xl border border-border bg-card p-4"
        onPressIn={() => {
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <View className="flex-row items-start justify-between">
          <Text className="flex-1 pr-4 text-lg font-semibold text-foreground" numberOfLines={1}>
            {board.title}
          </Text>
        </View>

        <Text className="text-sm text-muted-foreground" numberOfLines={2}>
          {board.description || t("kanban.noDescription")}
        </Text>

        <View className="mt-2 flex-row gap-4">
          <View className="flex-row items-center gap-1">
            <Image source="sf:folder" style={{ width: 14, height: 14 }} tintColor="gray" />
            <Text className="text-xs text-muted-foreground">
              {board.projects?.length || 0} {t("kanban.projects")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Image source="sf:person.2" style={{ width: 14, height: 14 }} tintColor="gray" />
            <Text className="text-xs text-muted-foreground">
              {board.members?.length || 0} {t("kanban.members")}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
