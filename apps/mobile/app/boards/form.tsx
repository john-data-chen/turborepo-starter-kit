import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";

import { useCreateBoard, useUpdateBoard, useBoard } from "@/hooks/use-boards";
import { View, Text, Pressable, TextInput, useCSSVariable } from "@/lib/tw";
import { useAuthStore } from "@/stores/auth";

export default function BoardFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ boardId?: string }>();
  const boardId = params.boardId;
  const isEdit = !!boardId;

  const { session } = useAuthStore();
  const { data: board, isLoading: isBoardLoading } = useBoard(boardId);
  const createMutation = useCreateBoard();
  const updateMutation = useUpdateBoard();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Theme-aware colors for KeyboardAvoidingView and inputs
  const bgColor = useCSSVariable("--color-background");
  const primaryColor = useCSSVariable("--color-primary");
  const mutedFgColor = useCSSVariable("--color-muted-foreground");

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
          },
          onError: (error) => {
            Alert.alert(t("kanban.actions.error"), error.message);
          }
        }
      );
    } else {
      createMutation.mutate(
        { title, description, owner: session?.user._id },
        {
          onSuccess: () => {
            router.back();
          },
          onError: (error) => {
            Alert.alert(t("kanban.actions.error"), error.message);
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: bgColor }}
    >
      <Stack.Screen
        options={{
          title: isEdit ? t("kanban.actions.editBoardTitle") : t("kanban.actions.newBoardTitle"),
          presentation: "formSheet",
          sheetGrabberVisible: true,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                router.back();
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  color: primaryColor
                }}
              >
                {t("kanban.actions.cancel")}
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={handleSubmit} disabled={isPending || !title}>
              {isPending ? (
                <ActivityIndicator />
              ) : (
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "600",
                    color: !title ? mutedFgColor : primaryColor
                  }}
                >
                  {isEdit ? t("kanban.actions.save") : t("kanban.actions.create")}
                </Text>
              )}
            </Pressable>
          )
        }}
      />

      {isEdit && isBoardLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <View className="gap-4 p-4">
          <View className="gap-2">
            <Text className="font-semibold text-foreground">
              {t("kanban.actions.boardTitleLabel")}
            </Text>
            <TextInput
              className="rounded-lg border border-input bg-input p-3 text-base text-foreground"
              style={{ borderCurve: "continuous" }}
              placeholder={t("kanban.actions.boardTitlePlaceholder")}
              placeholderTextColor={mutedFgColor}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View className="gap-2">
            <Text className="font-semibold text-foreground">
              {t("kanban.actions.descriptionLabel")}
            </Text>
            <TextInput
              className="h-32 rounded-lg border border-input bg-input p-3 text-base text-foreground"
              style={{ borderCurve: "continuous", textAlignVertical: "top" }}
              placeholder={t("kanban.actions.descriptionPlaceholder")}
              placeholderTextColor={mutedFgColor}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
