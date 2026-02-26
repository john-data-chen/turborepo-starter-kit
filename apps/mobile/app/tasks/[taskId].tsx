import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from "react-native";

import { useTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import { View, Text, TextInput, Pressable, ScrollView } from "@/lib/tw";

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const { data: task, isLoading } = useTask(taskId);
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: users = [] } = useUsers();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("TODO");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status || "TODO");
      setAssigneeId(
        task.assignee
          ? typeof task.assignee === "string"
            ? task.assignee
            : task.assignee._id
          : null
      );
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const handleSave = () => {
    if (!taskId) {
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateTaskMutation.mutate(
      {
        id: taskId,
        title,
        description,
        status: status as any,
        assigneeId,
        dueDate
      },
      {
        onSuccess: () => {
          router.back();
        }
      }
    );
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const handleDelete = () => {
    if (!taskId) {
      return;
    }

    Alert.alert(
      t("kanban.task.confirmDeleteTitle", { title: task?.title }) || "Delete Task",
      t("kanban.task.confirmDeleteDescription", { title: task?.title }) ||
        "Are you sure you want to delete this task?",
      [
        { text: t("common.cancel") || "Cancel", style: "cancel" },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteTaskMutation.mutate(taskId, {
              onSuccess: () => {
                router.back();
              }
            });
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!task) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-foreground">Task not found</Text>
      </View>
    );
  }

  const assigneeName = users.find((u) => u._id === assigneeId)?.name || "Unassigned";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: t("kanban.task.editTaskTitle") || "Edit Task",
          headerBackButtonDisplayMode: "minimal",
          headerLeft: undefined,
          headerRight: () => (
            <Pressable
              onPress={() => {
                handleSaveRef.current();
              }}
              disabled={updateTaskMutation.isPending}
            >
              <Text
                className={`font-semibold ${updateTaskMutation.isPending ? "text-muted-foreground" : "text-primary"}`}
              >
                {t("common.save") || "Save"}
              </Text>
            </Pressable>
          )
        }}
      />

      <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 gap-6">
        {/* Title */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.task.titleLabel") || "Title"}
          </Text>
          <TextInput
            className="rounded-lg border border-border bg-input p-3 text-foreground"
            value={title}
            onChangeText={setTitle}
            placeholder={t("kanban.task.titlePlaceholder") || "Task title"}
          />
        </View>

        {/* Status */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.task.statusLabel") || "Status"}
          </Text>
          <View className="flex-row gap-2">
            {["TODO", "IN_PROGRESS", "DONE"].map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  Haptics.selectionAsync();
                  setStatus(s);
                }}
                className={`flex-1 items-center rounded-lg border p-3 ${
                  status === s ? "border-primary bg-primary" : "border-border bg-card"
                }`}
              >
                <Text
                  className={`font-medium ${
                    status === s ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {t(
                    `kanban.task.${({ TODO: "statusTodo", IN_PROGRESS: "statusInProgress", DONE: "statusDone" } as Record<string, string>)[s]}`
                  ) || s.replace("_", " ")}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Assignee */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.task.assignToLabel") || "Assignee"}
          </Text>
          <Pressable
            onPress={() => {
              setShowAssigneeModal(true);
            }}
            className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3"
          >
            <Text className="text-foreground">{assigneeName}</Text>
            <Image source="sf:chevron.down" style={{ width: 12, height: 12 }} tintColor="gray" />
          </Pressable>
        </View>

        {/* Due Date */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.task.dueDateLabel") || "Due Date"}
          </Text>
          <Pressable
            onPress={() => {
              setShowDatePicker(true);
            }}
            className="flex-row items-center justify-between rounded-lg border border-border bg-card p-3"
          >
            <Text className="text-foreground">
              {dueDate ? format(dueDate, "MMM d, yyyy") : "Set due date"}
            </Text>
            <Image source="sf:calendar" style={{ width: 16, height: 16 }} tintColor="gray" />
          </Pressable>
          {showDatePicker &&
            (Platform.OS === "ios" ? (
              <View className="mt-2 rounded-lg bg-card p-2">
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display="inline"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    if (date) {
                      setDueDate(date);
                    }
                  }}
                />
                <Pressable
                  onPress={() => {
                    setShowDatePicker(false);
                  }}
                  className="items-center p-2"
                >
                  <Text className="font-medium text-primary">Done</Text>
                </Pressable>
              </View>
            ) : (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setDueDate(date);
                  }
                }}
              />
            ))}
        </View>

        {/* Description */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.task.descriptionLabel") || "Description"}
          </Text>
          <TextInput
            className="min-h-[100px] rounded-lg border border-border bg-input p-3 text-foreground"
            value={description}
            onChangeText={setDescription}
            placeholder={t("kanban.task.descriptionPlaceholder") || "Add description..."}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Delete Button */}
        <Pressable
          onPress={handleDelete}
          className="mt-4 items-center rounded-lg bg-destructive/10 p-4"
        >
          <Text className="font-semibold text-destructive">
            {t("kanban.task.delete") || "Delete Task"}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Assignee Modal */}
      <Modal
        visible={showAssigneeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAssigneeModal(false);
        }}
      >
        <View className="flex-1 bg-background">
          <View className="flex-row items-center justify-between border-b border-border p-4">
            <Text className="text-lg font-semibold text-foreground">Select Assignee</Text>
            <Pressable
              onPress={() => {
                setShowAssigneeModal(false);
              }}
            >
              <Text className="font-medium text-primary">Close</Text>
            </Pressable>
          </View>
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            contentContainerClassName="p-4"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  setAssigneeId(item._id);
                  setShowAssigneeModal(false);
                }}
                className={`flex-row items-center justify-between border-b border-border p-4 ${assigneeId === item._id ? "bg-secondary/50" : ""}`}
              >
                <View>
                  <Text className="font-medium text-foreground">{item.name}</Text>
                  <Text className="text-sm text-muted-foreground">{item.email}</Text>
                </View>
                {assigneeId === item._id && (
                  <Image source="sf:checkmark" style={{ width: 16, height: 16 }} tintColor="blue" />
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
