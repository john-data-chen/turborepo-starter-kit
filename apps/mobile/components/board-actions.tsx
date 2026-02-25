import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useDeleteBoard } from "@/hooks/use-boards";
import { Pressable } from "@/lib/tw";

interface BoardActionsProps {
  boardId: string;
  boardTitle: string;
}

export function BoardActions({ boardId, boardTitle }: BoardActionsProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const deleteMutation = useDeleteBoard();

  const handleEdit = () => {
    router.push({
      pathname: "/boards/form",
      params: { boardId }
    });
  };

  const handleDelete = () => {
    Alert.alert(
      t("kanban.actions.confirmDeleteTitle", { title: boardTitle }),
      t("kanban.actions.confirmDeleteDescription"),
      [
        { text: t("kanban.actions.cancel"), style: "cancel" },
        {
          text: t("kanban.actions.delete"),
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(boardId, {
              onSuccess: () => {
                router.replace("/(tabs)");
              }
            });
          }
        }
      ]
    );
  };

  return (
    <Pressable
      onPress={(e) => {
        e.stopPropagation();
        Alert.alert(t("kanban.actions.actions"), undefined, [
          { text: t("kanban.actions.edit"), onPress: handleEdit },
          { text: t("kanban.actions.delete"), onPress: handleDelete, style: "destructive" },
          { text: t("kanban.actions.cancel"), style: "cancel" }
        ]);
      }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={{ padding: 4 }}
    >
      <Image source="sf:ellipsis.circle" style={{ width: 24, height: 24 }} tintColor="white" />
    </Pressable>
  );
}
