import { TaskStatus } from "@repo/store";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, RefreshControl, useWindowDimensions } from "react-native";

import { BoardActions } from "@/components/board-actions";
import { ProjectColumn } from "@/components/project-column";
import { useBoard } from "@/hooks/use-boards";
import { useProjects } from "@/hooks/use-projects";
import { useCSSVariable, View, Text, ScrollView, Pressable, ActivityIndicator } from "@/lib/tw";

const STATUS_FILTERS: (TaskStatus | null)[] = [
  null,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE
];

export default function BoardDetailScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const router = useRouter();
  const {
    data: board,
    isLoading: isBoardLoading,
    refetch: refetchBoard,
    isRefetching: isBoardRefetching
  } = useBoard(boardId);
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    refetch: refetchProjects,
    isRefetching: isProjectsRefetching
  } = useProjects(boardId);
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  const isLoading = isBoardLoading || isProjectsLoading;
  const isRefetching = isBoardRefetching || isProjectsRefetching;

  const handleRefresh = () => {
    refetchBoard();
    refetchProjects();
  };

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => (a.orderInBoard || 0) - (b.orderInBoard || 0)),
    [projects]
  );

  const statusLabels: Record<string, string> = {
    ALL: t("kanban.task.total"),
    TODO: t("kanban.task.statusTodo"),
    IN_PROGRESS: t("kanban.task.statusInProgress"),
    DONE: t("kanban.task.statusDone")
  };

  // Column width: use 85% of screen or minimum 300
  const columnWidth = Math.max(300, screenWidth * 0.85);

  const primaryColor = useCSSVariable("--color-primary");

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: board?.title || t("kanban.title"),
          headerLeft: () => (
            <Pressable onPress={() =>{  router.back(); }} hitSlop={12} style={{ marginRight: 8 }}>
              <Image
                source="sf:chevron.left"
                style={{ width: 20, height: 20 }}
                tintColor={primaryColor}
              />
            </Pressable>
          ),
          headerRight: () =>
            board ? <BoardActions boardId={board._id} boardTitle={board.title} /> : null
        }}
      />

      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <View className="flex-1">
          {/* Status Filter Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
          >
            {STATUS_FILTERS.map((status) => {
              const isActive = statusFilter === status;
              const label = status === null ? statusLabels.ALL : statusLabels[status];
              return (
                <Pressable
                  key={status ?? "ALL"}
                  onPress={() =>{  setStatusFilter(status); }}
                  className={isActive ? "bg-primary" : "border border-border"}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderCurve: "continuous"
                  }}
                >
                  <Text
                    className={isActive ? "text-primary-foreground" : "text-muted-foreground"}
                    style={{ fontSize: 13, fontWeight: "600" }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            {/* New Project Button */}
            <Link href={`/projects/new?boardId=${boardId}`} asChild>
              <Pressable
                className="border border-border"
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Image source="sf:plus" style={{ width: 12, height: 12 }} tintColor="gray" />
                <Text className="text-muted-foreground" style={{ fontSize: 13, fontWeight: "600" }}>
                  {t("kanban.project.addProject")}
                </Text>
              </Pressable>
            </Link>
          </ScrollView>

          {/* Projects Horizontal Scroll */}
          {sortedProjects.length === 0 ? (
            <View className="flex-1 items-center justify-center p-5">
              <Text className="text-muted-foreground" style={{ fontSize: 16, textAlign: "center" }}>
                {t("kanban.noBoardsFound")}
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedProjects}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
              refreshControl=<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
              snapToInterval={columnWidth + 12}
              decelerationRate="fast"
              renderItem={({ item: project }) => (
                <View style={{ width: columnWidth, marginRight: 12 }}>
                  <ProjectColumn project={project} boardId={boardId} statusFilter={statusFilter} />
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}
