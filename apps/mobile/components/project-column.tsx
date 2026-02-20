import { Project } from "@repo/store";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useDeleteProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { View, Text, Pressable } from "@/lib/tw";

import { SortableTaskList } from "./sortable-task-list";

interface ProjectColumnProps {
  project: Project;
  boardId: string;
}

export function ProjectColumn({ project, boardId }: ProjectColumnProps) {
  const { t } = useTranslation();
  const { data: tasks = [] } = useTasks(project._id);
  const deleteProjectMutation = useDeleteProject();

  const handleDelete = () => {
    Alert.alert(
      t("kanban.project.deleteTitle") || "Delete Project",
      t("kanban.project.deleteDescription") || "Are you sure you want to delete this project?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: () =>{  deleteProjectMutation.mutate({ id: project._id, boardId }); }
        }
      ]
    );
  };

  return (
    <View className="mr-4 flex h-full w-[300px] flex-col overflow-hidden rounded-xl border border-border bg-secondary/10">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border bg-card p-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="truncate font-semibold text-foreground" numberOfLines={1}>
            {project.title}
          </Text>
          <View className="rounded-full bg-secondary px-2 py-0.5">
            <Text className="text-xs text-muted-foreground">{tasks.length}</Text>
          </View>
        </View>

        <Link href={`/projects/new?boardId=${boardId}&projectId=${project._id}`} asChild>
          <Link.Trigger>
            <Pressable className="p-1">
              <Image source="sf:ellipsis" style={{ width: 20, height: 20 }} tintColor="gray" />
            </Pressable>
          </Link.Trigger>
          <Link.Menu>
            <Link.MenuAction
              title={t("common.edit") || "Edit"}
              icon="pencil"
              onPress={() =>{ 
                router.push(`/projects/new?boardId=${boardId}&projectId=${project._id}`); }
              }
            />
            <Link.MenuAction
              title={t("common.delete") || "Delete"}
              icon="trash"
              destructive
              onPress={handleDelete}
            />
          </Link.Menu>
        </Link>
      </View>

      {/* Tasks List */}
      <View className="flex-1 p-2">
        <SortableTaskList
          tasks={tasks}
          projectId={project._id}
          boardId={boardId}
          onTaskPress={(taskId) =>{  router.push(`/tasks/${taskId}`); }}
        />
      </View>

      {/* Footer / Add Task */}
      <View className="border-t border-border bg-card p-2">
        <Link href={`/tasks/new?boardId=${boardId}&projectId=${project._id}`} asChild>
          <Pressable className="flex-row items-center justify-center rounded-lg p-2 hover:bg-secondary/50">
            <Image
              source="sf:plus"
              style={{ width: 16, height: 16, marginRight: 8 }}
              tintColor="gray"
            />
            <Text className="text-sm font-medium text-muted-foreground">
              {t("kanban.project.addTask") || "Add Task"}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
