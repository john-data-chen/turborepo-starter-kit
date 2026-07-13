"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { memo, Suspense, useEffect } from "react";

import { Board } from "@/components/kanban/board/Board";
import PageContainer from "@/components/layout/PageContainer";
import { useSyncToastListener } from "@/hooks/useSyncToast";
import { useWorkspaceStore } from "@/stores/workspace-store";

const MemoizedBoard = memo(Board);

export default function BoardPage() {
  const params = useParams();
  const t = useTranslations("kanban");
  const boardId = params?.boardId as string;
  const setCurrentBoardId = useWorkspaceStore((state) => state.setCurrentBoardId);
  const fetchProjectsWithTasks = useWorkspaceStore((state) => state.fetchProjectsWithTasks);
  const projects = useWorkspaceStore((state) => state.projects);

  // The board renders from the zustand store (its own 5s poll), bypassing the react-query
  // hooks that carry the sync listener — so remote project/task changes never toasted here.
  // Flatten project + task updatedAt values and watch them directly.
  const syncItems = projects.flatMap((p) => [
    { updatedAt: p.updatedAt },
    ...(p.tasks ?? []).map((t) => ({ updatedAt: t.updatedAt }))
  ]);
  useSyncToastListener(syncItems, syncItems.length > 0, boardId);

  useEffect(() => {
    if (!boardId) {
      return;
    }
    setCurrentBoardId(boardId);
    void fetchProjectsWithTasks(boardId);

    const interval = setInterval(() => {
      void fetchProjectsWithTasks(boardId);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [boardId, setCurrentBoardId, fetchProjectsWithTasks]);

  return (
    <PageContainer>
      <main className="space-y-4">
        <Suspense fallback={<div>{t("loadingBoard")}</div>}>
          <MemoizedBoard />
        </Suspense>
      </main>
    </PageContainer>
  );
}
