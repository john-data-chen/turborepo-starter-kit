import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";

import { BoardCard } from "@/components/board-card";
import { useBoards } from "@/hooks/use-boards";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from "@/lib/tw";

type FilterType = "all" | "my" | "team";

const FILTERS: FilterType[] = ["all", "my", "team"];

export default function BoardsScreen() {
  const { t } = useTranslation();
  const { data, isLoading, refetch, isRefetching } = useBoards();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredMyBoards = useMemo(
    () =>
      (data?.myBoards || []).filter((b) => b.title.toLowerCase().includes(search.toLowerCase())),
    [data?.myBoards, search]
  );

  const filteredTeamBoards = useMemo(
    () =>
      (data?.teamBoards || []).filter((b) => b.title.toLowerCase().includes(search.toLowerCase())),
    [data?.teamBoards, search]
  );

  const showMy = filter === "all" || filter === "my";
  const showTeam = filter === "all" || filter === "team";
  const isEmpty =
    !isLoading &&
    (!showMy || filteredMyBoards.length === 0) &&
    (!showTeam || filteredTeamBoards.length === 0);

  const filterLabels: Record<FilterType, string> = {
    all: t("kanban.allBoards"),
    my: t("kanban.myBoards"),
    team: t("kanban.teamBoards")
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 gap-5"
      contentInsetAdjustmentBehavior="automatic"
      refreshControl=<RefreshControl refreshing={isRefetching} onRefresh={refetch} />
    >
      <Stack.Screen options={{ title: t("sidebar.overview") }} />

      {/* New Board Button */}
      <Link href="/boards/form" asChild>
        <Pressable className="items-center rounded-lg bg-primary py-3">
          <Text className="font-semibold text-primary-foreground">{t("kanban.newBoard")}</Text>
        </Pressable>
      </Link>

      {/* Search Bar */}
      <View className="flex-row items-center rounded-lg border border-border bg-card px-3">
        <Image source="sf:magnifyingglass" style={{ width: 18, height: 18, tintColor: "#888" }} />
        <TextInput
          className="flex-1 py-3 pl-2 text-foreground"
          placeholder={t("kanban.searchBoards")}
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Filter Pills */}
      <View className="flex-row gap-2">
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            className={`flex-1 items-center rounded-lg py-2 ${f === filter ? "bg-primary" : "border border-border bg-card"}`}
            onPress={() =>{  setFilter(f); }}
          >
            <Text
              className={`text-sm font-medium ${f === filter ? "text-primary-foreground" : "text-muted-foreground"}`}
            >
              {filterLabels[f]}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading && !isRefetching ? <ActivityIndicator size="large" className="mt-8" /> : null}

      {!isLoading && !isEmpty ? (
        <>
          {showMy && filteredMyBoards.length > 0 ? (
            <View className="gap-3">
              <View className="gap-1 px-1">
                <Text className="text-2xl font-bold text-foreground">{t("kanban.myBoards")}</Text>
                <Text className="text-sm text-muted-foreground">
                  {t("kanban.myBoardsDescription")}
                </Text>
              </View>
              <View className="gap-3">
                {filteredMyBoards.map((board) => (
                  <BoardCard key={board._id} board={board} />
                ))}
              </View>
            </View>
          ) : null}

          {showTeam && filteredTeamBoards.length > 0 ? (
            <View className="gap-3">
              <View className="gap-1 px-1">
                <Text className="text-2xl font-bold text-foreground">{t("kanban.teamBoards")}</Text>
                <Text className="text-sm text-muted-foreground">
                  {t("kanban.teamBoardsDescription")}
                </Text>
              </View>
              <View className="gap-3">
                {filteredTeamBoards.map((board) => (
                  <BoardCard key={board._id} board={board} showOwner />
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {!isLoading && isEmpty ? (
        <View className="flex-1 items-center justify-center gap-4 py-20">
          <Text className="text-center text-lg text-muted-foreground">
            {t("kanban.noBoardsFound")}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
