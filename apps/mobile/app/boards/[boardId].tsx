import { TaskStatus } from "@repo/store";
import { Image } from "expo-image";
import { Link, useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

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

  const foregroundColor = useCSSVariable("--color-foreground");
  const primaryColor = useCSSVariable("--color-primary");
  const cardColor = useCSSVariable("--color-card");

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: board?.title || t("kanban.title"),
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back();
              }}
              hitSlop={12}
              style={{ marginRight: 8 }}
            >
              <Image
                source="sf:chevron.left"
                style={{ width: 20, height: 20 }}
                tintColor={foregroundColor}
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
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingRight: 24,
              paddingVertical: 8,
              gap: 6
            }}
          >
            {STATUS_FILTERS.map((status) => {
              const isActive = statusFilter === status;
              const label = status === null ? statusLabels.ALL : statusLabels[status];
              return (
                <Pressable
                  key={status ?? "ALL"}
                  onPress={() => {
                    setStatusFilter(status);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: isActive ? "transparent" : "rgba(255, 255, 255, 0.15)",
                    backgroundColor: isActive ? primaryColor : cardColor
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: "white"
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}

            {/* New Project Button */}
            <Link href={`/projects/new?boardId=${boardId}`} asChild>
              <Pressable
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderCurve: "continuous",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  backgroundColor: cardColor,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4
                }}
              >
                <Image source="sf:plus" style={{ width: 12, height: 12 }} tintColor="white" />
                <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>
                  {t("kanban.project.addProject")}
                </Text>
              </Pressable>
            </Link>
          </ScrollView>

          {/* Projects Vertical List — matches web mobile view layout */}
          {sortedProjects.length === 0 ? (
            <View className="flex-1 items-center justify-center p-5">
              <Text className="text-muted-foreground" style={{ fontSize: 16, textAlign: "center" }}>
                {t("kanban.noBoardsFound")}
              </Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 16 }}
              refreshControl=<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
            >
              {sortedProjects.map((project) => (
                <ProjectColumn
                  key={project._id}
                  project={project}
                  boardId={boardId}
                  statusFilter={statusFilter}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}
