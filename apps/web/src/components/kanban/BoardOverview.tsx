"use client";

import { DotsHorizontalIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@repo/ui/components/select";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useBoards } from "@/hooks/useBoards";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AuthService } from "@/lib/auth/authService";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

import { BoardActions } from "./board/BoardActions";
import NewBoardDialog from "./board/NewBoardDialog";

type FilterType = "all" | "my" | "team";

export function BoardOverview() {
  const { myBoards, teamBoards, loading: boardsLoading, refresh } = useBoards();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("kanban");
  const tLogin = useTranslations("login");
  const { setUserInfo } = useWorkspaceStore();
  const { setSession } = useAuthStore();
  const [recentlyDeleted, setRecentlyDeleted] = useState<Set<string>>(new Set());

  // Handle board click with proper event handling
  const handleBoardClick = useCallback(
    (boardId: string, e?: React.MouseEvent) => {
      // Always prevent default to avoid any default link behavior
      e?.preventDefault();
      e?.stopPropagation();

      // If this is a click on the actions menu or a recently deleted board, don't navigate
      const isActionsClick = (e?.target as HTMLElement)?.closest(".board-actions");

      if (recentlyDeleted.has(boardId) || isActionsClick) {
        return;
      }

      // Only navigate if we have a valid board ID and it's not recently deleted
      if (boardId && !recentlyDeleted.has(boardId)) {
        router.push(`/boards/${boardId}`);
      }
    },
    [recentlyDeleted, router]
  );

  // Handle board deletion
  const handleBoardDelete = useCallback(
    (boardId: string) => {
      // Store the current path
      const currentPath = globalThis.location.pathname;

      // Add to recently deleted set
      setRecentlyDeleted((prev) => new Set(prev).add(boardId));

      // Immediately redirect to /boards if we're on a board page
      if (currentPath.includes(`/board/`)) {
        globalThis.location.href = "/boards";
        return;
      }

      // Refresh the board list
      refresh();

      // Force a hard refresh to ensure we're on the correct page
      if (currentPath.endsWith("/boards")) {
        globalThis.location.reload();
      } else {
        globalThis.location.href = "/boards";
      }
    },
    [refresh]
  );

  // Handle login success and user data initialization
  useEffect(() => {
    const loginSuccess = searchParams.get("login_success");

    const processLogin = async () => {
      if (loginSuccess !== "true") {
        return;
      }

      try {
        setIsProcessingLogin(true);

        // Always fetch fresh session to ensure we have the latest data
        const session = await AuthService.getSession();

        if (session?.user?._id) {
          // Update both auth and workspace stores with the user info
          setSession(session);
          setUserInfo(session.user.email, session.user._id);

          // Manually trigger boards data refresh after user info is set
          await refresh();

          // Show success message
          toast.success(tLogin("success"));

          // Clean up URL
          const params = new URLSearchParams(searchParams.toString());
          params.delete("login_success");
          const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
          await router.replace(newUrl, { scroll: false });
        } else {
          throw new Error("Failed to get user session");
        }
      } catch (error) {
        console.error("Error processing login:", error);
        toast.error(tLogin("error"));
      } finally {
        setIsProcessingLogin(false);
      }
    };

    processLogin();
  }, [searchParams, router, pathname, tLogin, setSession, setUserInfo, refresh]);

  // Ensure boards data is fetched when user is authenticated
  useEffect(() => {
    const { userId } = useWorkspaceStore.getState();

    // If user is authenticated but we don't have boards data, fetch it
    if (userId && !boardsLoading && !myBoards?.length && !teamBoards?.length) {
      refresh();
    }
  }, [refresh, myBoards, teamBoards, boardsLoading]);

  // Handle data refresh on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  // Show loading state while processing login or loading boards
  if (isProcessingLogin || boardsLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  const filteredMyBoards = myBoards?.filter((board) =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTeamBoards = teamBoards?.filter((board) =>
    board.title.toLowerCase().includes(search.toLowerCase())
  );

  const shouldShowMyBoards = filter === "all" || filter === "my";
  const shouldShowTeamBoards = filter === "all" || filter === "team";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="sticky top-0 z-10 flex flex-col items-start justify-between gap-2 bg-background p-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-[200px]">
          <NewBoardDialog>
            <Button
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              data-testid="new-board-trigger"
            >
              {t("newBoard")}
            </Button>
          </NewBoardDialog>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <MagnifyingGlassIcon className="absolute top-2.5 left-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t("searchBoards")}
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          <Select
            value={filter}
            onValueChange={(value: FilterType) => {
              setFilter(value);
            }}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-filter-trigger">
              {" "}
              {/* Add data-testid here */}
              <SelectValue placeholder={t("filterBoards")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="selectAllBoards">
                {t("allBoards")}
              </SelectItem>
              <SelectItem value="my" data-testid="selectMyBoards">
                {t("myBoards")}
              </SelectItem>
              <SelectItem value="team" data-testid="selectTeamBoards">
                {t("teamBoards")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {shouldShowMyBoards && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-4">
                <h2 className="text-2xl font-bold" data-testid="myBoardsTitle">
                  {t("myBoards")}
                </h2>
              </div>
              <div className="mb-2 flex items-center gap-2 px-4">
                <span className="text-sm text-muted-foreground">{t("myBoardsDescription")}</span>
              </div>
              {filteredMyBoards?.length === 0 ? (
                <p className="px-4 text-muted-foreground">{t("noBoardsFound")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMyBoards?.map((board) => (
                    <Card
                      key={board._id}
                      className="cursor-pointer rounded-lg py-4 shadow-md transition-colors hover:border-primary"
                      onClick={() => {
                        handleBoardClick(board._id);
                      }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1">
                        <CardTitle className="text-lg font-semibold">{board.title}</CardTitle>
                        <BoardActions
                          board={board}
                          asChild
                          className="board-actions"
                          onDelete={() => {
                            handleBoardDelete(board._id);
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="-mr-2 h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                            aria-label={board.title ? `${board.title} actions` : "Board actions"}
                          >
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </BoardActions>
                      </CardHeader>
                      <CardContent className="px-4 pt-2">
                        <p className="mb-2 text-sm text-muted-foreground">
                          {board.description || t("noDescription")}
                        </p>
                        <p className="mb-1 text-sm">
                          {t("projects")}:{" "}
                          {board.projects.length > 0
                            ? board.projects.map((p) => p.title).join(" / ")
                            : "0"}
                        </p>
                        <p className="text-sm">
                          {t("members")}: {board.members.map((m) => m.name).join(", ")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}

          {shouldShowTeamBoards && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-4">
                <h2 className="text-2xl font-bold" data-testid="teamBoardsTitle">
                  {t("teamBoards")}
                </h2>
              </div>
              <div className="mb-2 flex items-center gap-2 px-4">
                <span className="text-sm text-muted-foreground">{t("teamBoardsDescription")}</span>
              </div>
              {filteredTeamBoards?.length === 0 ? (
                <p className="px-4 text-muted-foreground">{t("noTeamBoardsFound")}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTeamBoards?.map((board) => (
                    <Card
                      key={board._id}
                      className="cursor-pointer rounded-lg py-4 shadow-md transition-colors hover:border-primary"
                      onClick={() => {
                        handleBoardClick(board._id);
                      }}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1">
                        <CardTitle className="text-lg font-semibold">{board.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pt-2">
                        <p className="mb-2 text-sm text-muted-foreground">
                          {board.description || t("noDescription")}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>
                            {t("owner")}:{" "}
                            {typeof board.owner === "string"
                              ? board.owner
                              : board.owner?.name || "Unknown"}
                          </p>
                          <p>
                            {t("projects")}:{" "}
                            {board.projects.length > 0
                              ? board.projects.map((p) => p.title).join(" / ")
                              : "0"}
                          </p>
                          <p>
                            {t("members")}: {board.members.map((m) => m.name).join(", ")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
