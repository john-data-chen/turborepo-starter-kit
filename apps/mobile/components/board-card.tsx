import type { Board } from "@repo/store";
import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

  const projectNames = useMemo(
    () => (board.projects?.length > 0 ? board.projects.map((p) => p.title).join(" / ") : "0"),
    [board.projects]
  );

  const memberNames = useMemo(
    () => (board.members?.length > 0 ? board.members.map((m) => m.name).join(", ") : ""),
    [board.members]
  );

  const ownerName = useMemo(
    () => (typeof board.owner === "string" ? board.owner : board.owner?.name || "Unknown"),
    [board.owner]
  );

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
        className={`rounded-xl border bg-card px-4 pt-3.5 pb-4 ${pressed ? "border-primary" : "border-border"}`}
        style={{
          borderCurve: "continuous",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
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
