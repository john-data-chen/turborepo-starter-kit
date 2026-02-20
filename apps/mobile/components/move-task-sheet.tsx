import { Project } from "@repo/store";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Modal, ActivityIndicator, Platform, ActionSheetIOS } from "react-native";

import { useProjects } from "@/hooks/use-projects";
import { useMoveTask } from "@/hooks/use-tasks";
import { View, Text, Pressable, ScrollView } from "@/lib/tw";

interface MoveTaskSheetProps {
  visible: boolean;
  taskId: string;
  currentProjectId: string;
  boardId: string;
  onClose: () => void;
}

export function MoveTaskSheet({
  visible,
  taskId,
  currentProjectId,
  boardId,
  onClose
}: MoveTaskSheetProps) {
  const { t } = useTranslation();
  const { data: projects = [], isLoading } = useProjects(boardId);
  const moveTaskMutation = useMoveTask();

  const availableProjects = projects.filter((p: Project) => p._id !== currentProjectId);

  const handleMove = (targetProjectId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    moveTaskMutation.mutate(
      {
        taskId,
        projectId: targetProjectId,
        orderInProject: 0
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  if (Platform.OS === "ios") {
    if (visible && !isLoading && availableProjects.length > 0) {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...availableProjects.map((p) => p.title), t("common.cancel") || "Cancel"],
          cancelButtonIndex: availableProjects.length,
          title: t("kanban.task.moveToTitle") || "Move to Project",
          message: t("kanban.task.moveToDescription") || "Select a project to move this task to"
        },
        (buttonIndex) => {
          if (buttonIndex < availableProjects.length) {
            handleMove(availableProjects[buttonIndex]._id);
          } else {
            onClose();
          }
        }
      );
    }
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
        <Pressable
          className="max-h-[50%] rounded-t-2xl bg-background"
          onPress={(e) =>{  e.stopPropagation(); }}
        >
          <View className="flex-row items-center justify-between border-b border-border p-4">
            <Text className="text-lg font-semibold text-foreground">
              {t("kanban.task.moveToTitle") || "Move to Project"}
            </Text>
            <Pressable onPress={onClose}>
              <Image source="sf:xmark" style={{ width: 20, height: 20 }} tintColor="gray" />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="items-center p-8">
              <ActivityIndicator size="large" />
              <Text className="mt-2 text-muted-foreground">
                {t("common.loading") || "Loading..."}
              </Text>
            </View>
          ) : availableProjects.length === 0 ? (
            <View className="items-center p-8">
              <Text className="text-muted-foreground">
                {t("kanban.task.noProjectsAvailable") || "No other projects available"}
              </Text>
            </View>
          ) : (
            <ScrollView className="max-h-[300px]">
              {availableProjects.map((project) => (
                <Pressable
                  key={project._id}
                  onPress={() =>{  handleMove(project._id); }}
                  disabled={moveTaskMutation.isPending}
                  className="flex-row items-center justify-between border-b border-border p-4 active:bg-secondary/50"
                >
                  <View className="flex-1">
                    <Text className="font-medium text-foreground">{project.title}</Text>
                    {project.description && (
                      <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                        {project.description}
                      </Text>
                    )}
                  </View>
                  {moveTaskMutation.isPending &&
                  moveTaskMutation.variables?.projectId === project._id ? (
                    <ActivityIndicator size="small" />
                  ) : (
                    <Image
                      source="sf:chevron.right"
                      style={{ width: 16, height: 16 }}
                      tintColor="gray"
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
