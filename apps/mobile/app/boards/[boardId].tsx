import { useLocalSearchParams, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

import { BoardActions } from "@/components/board-actions";
import { useBoard } from "@/hooks/use-boards";
import { View, Text, ScrollView, ActivityIndicator } from "@/lib/tw";

export default function BoardDetailScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const { data: board, isLoading, refetch, isRefetching } = useBoard(boardId);
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: board?.title || t("kanban.loadingBoard"),
          headerRight: () =>
            board ? <BoardActions boardId={board._id} boardTitle={board.title} /> : null
        }}
      />

      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4"
          horizontal
          showsHorizontalScrollIndicator={false}
          refreshControl=<RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        >
          {board?.projects?.length === 0 ? (
            <View className="w-screen items-center justify-center py-20">
              <Text className="text-muted-foreground">No projects found.</Text>
            </View>
          ) : (
            board?.projects?.map((project) => (
              <View key={project._id} className="mr-4 h-full w-80 rounded-lg bg-secondary p-4">
                <Text className="mb-4 font-bold">{project.title}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}
