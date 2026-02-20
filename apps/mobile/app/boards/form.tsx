import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";

import { useCreateBoard, useUpdateBoard, useBoard } from "@/hooks/use-boards";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "@/lib/tw";

export default function BoardFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const isEdit = !!boardId;

  const { data: board, isLoading: isBoardLoading } = useBoard(boardId);
  const createMutation = useCreateBoard();
  const updateMutation = useUpdateBoard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (board && isEdit) {
      setTitle(board.title);
      setDescription(board.description || "");
    }
  }, [board, isEdit]);

  const handleSubmit = () => {
    if (!title) {
      return;
    }

    if (isEdit && boardId) {
      updateMutation.mutate(
        { id: boardId, title, description },
        {
          onSuccess: () => {
            router.back();
          }
        }
      );
    } else {
      createMutation.mutate(
        { title, description },
        {
          onSuccess: () => {
            router.back();
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <Stack.Screen
        options={{
          title: isEdit ? t("kanban.actions.editBoardTitle") : t("kanban.actions.newBoardTitle"),
          presentation: "formSheet",
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back();
              }}
            >
              <Text className="text-lg text-primary">{t("kanban.actions.cancel")}</Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSubmit} disabled={isPending || !title}>
              {isPending ? (
                <ActivityIndicator />
              ) : (
                <Text className={`text-lg font-semibold ${!title ? "text-muted" : "text-primary"}`}>
                  {t("kanban.actions.saveChanges")}
                </Text>
              )}
            </Pressable>
          )
        }}
      />

      {isEdit && isBoardLoading ? (
        <ActivityIndicator className="mt-10" />
      ) : (
        <View className="gap-4 p-4">
          <View className="gap-2">
            <Text className="font-semibold text-foreground">
              {t("kanban.actions.boardTitleLabel")}
            </Text>
            <TextInput
              className="rounded-lg border border-border bg-input p-3 text-foreground"
              placeholder={t("kanban.actions.boardTitlePlaceholder")}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="gap-2">
            <Text className="font-semibold text-foreground">
              {t("kanban.actions.descriptionLabel")}
            </Text>
            <TextInput
              className="h-32 rounded-lg border border-border bg-input p-3 text-foreground"
              placeholder={t("kanban.actions.descriptionPlaceholder")}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
