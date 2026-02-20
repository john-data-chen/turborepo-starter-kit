import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

import { BoardCard } from "@/components/board-card";
import { useBoards } from "@/hooks/use-boards";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "@/lib/tw";

export default function BoardsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, isRefetching } = useBoards();

  const myBoards = data?.myBoards || [];
  const teamBoards = data?.teamBoards || [];
  const isEmpty = !isLoading && myBoards.length === 0 && teamBoards.length === 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 gap-6"
      contentInsetAdjustmentBehavior="automatic"
      refreshControl=<RefreshControl refreshing={isRefetching} onRefresh={refetch} />
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/boards/form" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Image
                    source="sf:plus"
                    style={{ width: 24, height: 24, opacity: pressed ? 0.5 : 1 }}
                    tintColor="#007AFF"
                  />
                )}
              </Pressable>
            </Link>
          )
        }}
      />

      {isLoading && !isRefetching ? <ActivityIndicator size="large" className="mt-8" /> : null}

      {!isLoading && !isEmpty ? (
        <>
          {myBoards.length > 0 && (
            <View className="gap-2">
              <Text className="px-1 text-xl font-bold text-foreground">{t("kanban.myBoards")}</Text>
              <View className="gap-3">
                {myBoards.map((board) => (
                  <BoardCard key={board._id} board={board} />
                ))}
              </View>
            </View>
          )}

          {teamBoards.length > 0 && (
            <View className="gap-2">
              <Text className="px-1 text-xl font-bold text-foreground">
                {t("kanban.teamBoards")}
              </Text>
              <View className="gap-3">
                {teamBoards.map((board) => (
                  <BoardCard key={board._id} board={board} />
                ))}
              </View>
            </View>
          )}
        </>
      ) : null}

      {!isLoading && isEmpty ? (
        <View className="flex-1 items-center justify-center gap-4 py-20">
          <Text className="text-center text-lg text-muted-foreground">
            {t("kanban.noBoardsFound")}
          </Text>
          <Link href="/boards/form" asChild>
            <Pressable className="rounded-lg bg-primary px-6 py-3">
              <Text className="font-semibold text-primary-foreground">{t("kanban.newBoard")}</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}
    </ScrollView>
  );
}
