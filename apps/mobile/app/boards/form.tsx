import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator
} from "react-native";

import { useCreateBoard, useUpdateBoard, useBoard } from "@/hooks/use-boards";
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
      style={{ flex: 1, backgroundColor: "hsl(180, 35%, 5%)" }}
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
                  color: "hsl(180, 75%, 45%)"
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
                    color: !title ? "hsl(180, 25%, 40%)" : "hsl(180, 75%, 45%)"
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
        <View style={{ padding: 16, gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontWeight: "600",
                color: "hsl(180, 20%, 100%)"
              }}
            >
              {t("kanban.actions.boardTitleLabel")}
            </Text>
            <TextInput
              style={{
                borderRadius: 8,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "hsl(180, 20%, 25%)",
                backgroundColor: "hsl(180, 20%, 25%)",
                padding: 12,
                color: "hsl(180, 20%, 100%)",
                fontSize: 16
              }}
              placeholder={t("kanban.actions.boardTitlePlaceholder")}
              placeholderTextColor="hsl(180, 25%, 50%)"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontWeight: "600",
                color: "hsl(180, 20%, 100%)"
              }}
            >
              {t("kanban.actions.descriptionLabel")}
            </Text>
            <TextInput
              style={{
                height: 128,
                borderRadius: 8,
                borderCurve: "continuous",
                borderWidth: 1,
                borderColor: "hsl(180, 20%, 25%)",
                backgroundColor: "hsl(180, 20%, 25%)",
                padding: 12,
                color: "hsl(180, 20%, 100%)",
                fontSize: 16,
                textAlignVertical: "top"
              }}
              placeholder={t("kanban.actions.descriptionPlaceholder")}
              placeholderTextColor="hsl(180, 25%, 50%)"
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
