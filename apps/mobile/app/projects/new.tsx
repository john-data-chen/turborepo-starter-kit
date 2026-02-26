import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";

import { useCreateProject, useUpdateProject, useProjects } from "@/hooks/use-projects";
import { View, Text, TextInput, Pressable, ScrollView } from "@/lib/tw";
import { useAuthStore } from "@/stores/auth";

export default function ProjectFormScreen() {
  const { boardId, projectId } = useLocalSearchParams<{ boardId: string; projectId?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { session } = useAuthStore();

  const { data: projects = [], isLoading: isLoadingProjects } = useProjects(boardId);
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const isEditMode = !!projectId;
  const project = isEditMode ? projects.find((p) => p._id === projectId) : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEditMode && projectId) {
      updateProjectMutation.mutate(
        {
          id: projectId,
          title,
          description: description || null
        },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (error) => {
            Alert.alert(t("common.error") || "Error", error.message);
          }
        }
      );
    } else {
      if (!boardId) {
        return;
      }
      createProjectMutation.mutate(
        {
          title,
          description: description || null,
          boardId,
          owner: session?.user._id
        },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (error) => {
            Alert.alert(t("common.error") || "Error", error.message);
          }
        }
      );
    }
  };

  if (isEditMode && isLoadingProjects) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isPending = createProjectMutation.isPending || updateProjectMutation.isPending;

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Stack.Screen
        options={{
          title: isEditMode
            ? t("kanban.project.editProjectTitle") || "Edit Project"
            : t("kanban.project.addNewProjectTitle") || "New Project",
          presentation: "formSheet",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back();
              }}
            >
              <Text className="font-medium text-primary">{t("common.cancel") || "Cancel"}</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => {
                handleSaveRef.current();
              }}
              disabled={isPending}
            >
              <Text
                className={`font-semibold ${isPending ? "text-muted-foreground" : "text-primary"}`}
              >
                {isEditMode ? t("common.save") || "Save" : t("common.create") || "Create"}
              </Text>
            </Pressable>
          )
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="p-4 gap-6"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.project.titleLabel") || "Title"}
          </Text>
          <TextInput
            className="rounded-lg border border-border bg-input p-3 text-foreground"
            value={title}
            onChangeText={setTitle}
            placeholder={t("kanban.project.titlePlaceholder") || "Project title"}
          />
        </View>

        {/* Description */}
        <View className="gap-2">
          <Text className="text-sm font-medium text-muted-foreground">
            {t("kanban.project.descriptionLabel") || "Description"}
          </Text>
          <TextInput
            className="min-h-[100px] rounded-lg border border-border bg-input p-3 text-foreground"
            value={description}
            onChangeText={setDescription}
            placeholder={t("kanban.project.descriptionPlaceholder") || "Add description..."}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
