import type { Board } from "@repo/store";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { BoardActions } from "@/components/board-actions";
import { View, Text, Pressable } from "@/lib/tw";

interface BoardCardProps {
  board: Board;
  showOwner?: boolean;
}

export function BoardCard({ board, showOwner }: BoardCardProps) {
  const { t } = useTranslation();
  const [pressed, setPressed] = useState(false);

  const projectNames =
    board.projects?.length > 0 ? board.projects.map((p) => p.title).join(" / ") : "0";

  const memberNames = board.members?.length > 0 ? board.members.map((m) => m.name).join(", ") : "";

  const ownerName = typeof board.owner === "string" ? board.owner : board.owner?.name || "Unknown";

  const handlePressIn = useCallback(() => {
    setPressed(true);
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handlePressOut = useCallback(() => {
    setPressed(false);
  }, []);

  return (
    <Link href={`/boards/${board._id}`} asChild>
      <Pressable
        style={{
          borderRadius: 12,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: pressed ? "hsl(180, 75%, 45%)" : "hsl(180, 20%, 28%)",
          backgroundColor: "hsl(180, 35%, 13%)",
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 16,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Header: title + actions — matches web CardHeader layout */}
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="flex-1 pr-4 text-lg font-semibold text-foreground" numberOfLines={1}>
            {board.title}
          </Text>
          <BoardActions boardId={board._id} boardTitle={board.title} />
        </View>

        {/* Description */}
        <Text className="mb-3 text-sm text-muted-foreground" numberOfLines={2}>
          {board.description || t("kanban.noDescription")}
        </Text>

        {/* Metadata — matches web CardContent layout */}
        <View className="gap-1">
          {showOwner ? (
            <Text className="text-sm text-foreground">
              {t("kanban.owner")}: {ownerName}
            </Text>
          ) : null}

          <Text className="text-sm text-foreground">
            {t("kanban.projects")}: {projectNames}
          </Text>

          <Text className="text-sm text-foreground">
            {t("kanban.members")}: {memberNames}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
