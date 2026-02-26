import { Task, TaskStatus } from "@repo/store";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { Link, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS
} from "react-native-reanimated";

import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { View, Text, Pressable } from "@/lib/tw";

interface TaskCardProps {
  task: Task;
  onMoveToProject?: () => void;
}

const SWIPE_THRESHOLD = 60;

const STATUS_ORDER: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const { t } = useTranslation();
  let bgClass = "bg-gray-500";
  let label = t("kanban.task.statusTodo") || "Todo";

  switch (status) {
    case "IN_PROGRESS":
      bgClass = "bg-blue-500";
      label = t("kanban.task.statusInProgress") || "In Progress";
      break;
    case "DONE":
      bgClass = "bg-green-500";
      label = t("kanban.task.statusDone") || "Done";
      break;
  }

  return (
    <View className={`${bgClass} rounded-full px-2 py-0.5`}>
      <Text className="text-xs font-medium text-white">{label}</Text>
    </View>
  );
};

export function TaskCard({ task, onMoveToProject }: TaskCardProps) {
  const { t } = useTranslation();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const translateX = useSharedValue(0);
  const context = useSharedValue(0);

  const cycleStatus = () => {
    const currentIndex = STATUS_ORDER.indexOf(task.status || TaskStatus.TODO);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    const nextStatus = STATUS_ORDER[nextIndex];

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateTaskMutation.mutate({ id: task._id, status: nextStatus });
  };

  const handleMoveTo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onMoveToProject) {
      onMoveToProject();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t("kanban.task.confirmDeleteTitle", { title: task.title }) || "Delete Task",
      t("kanban.task.confirmDeleteDescription", { title: task.title }) ||
        "Are you sure you want to delete this task?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteTaskMutation.mutate(task._id);
          }
        }
      ]
    );
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      context.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX + context.value;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe Right - Cycle Status
        runOnJS(cycleStatus)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe Left - Move to Project
        runOnJS(handleMoveTo)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <Link href={`/tasks/${task._id}`} asChild>
          <Link.Trigger>
            <Pressable
              className="rounded-xl bg-card"
              style={{
                padding: 16,
                marginBottom: 12,
                gap: 12,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.25)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)"
              }}
            >
              <View className="flex-row items-start justify-between">
                <Text
                  className="mr-2 flex-1 text-base font-medium text-foreground"
                  numberOfLines={2}
                >
                  {task.title}
                </Text>
                <StatusBadge status={task.status || "TODO"} />
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1">
                  {task.assignee && (
                    <Text className="text-xs text-muted-foreground">
                      {typeof task.assignee === "string"
                        ? "Assigned"
                        : task.assignee.name || task.assignee.email}
                    </Text>
                  )}
                </View>
                {task.dueDate && (
                  <Text className="text-xs text-muted-foreground">
                    {format(new Date(task.dueDate), "MMM d")}
                  </Text>
                )}
              </View>
            </Pressable>
          </Link.Trigger>
          <Link.Menu>
            <Link.MenuAction
              title={t("common.edit") || "Edit"}
              icon="pencil"
              onPress={() => {
                router.push(`/tasks/${task._id}`);
              }}
            />
            <Link.MenuAction
              title={t("kanban.task.moveTask") || "Move task"}
              icon="arrow.right.square"
              onPress={handleMoveTo}
            />
            <Link.MenuAction
              title={t("common.delete") || "Delete"}
              icon="trash"
              destructive
              onPress={handleDelete}
            />
          </Link.Menu>
        </Link>
      </Animated.View>
    </GestureDetector>
  );
}
