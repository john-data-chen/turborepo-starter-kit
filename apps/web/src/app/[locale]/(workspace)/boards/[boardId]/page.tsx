"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { memo, Suspense, useEffect } from "react";

import { Board } from "@/components/kanban/board/Board";
import PageContainer from "@/components/layout/PageContainer";
import { useWorkspaceStore } from "@/stores/workspace-store";

const MemoizedBoard = memo(Board);

export default function BoardPage() {
  const params = useParams();
  const t = useTranslations("kanban");
  const boardId = params?.boardId as string;
  const setCurrentBoardId = useWorkspaceStore((state) => state.setCurrentBoardId);
  const fetchProjectsWithTasks = useWorkspaceStore((state) => state.fetchProjectsWithTasks);

  useEffect(() => {
    if (!boardId) {
      return;
    }
    setCurrentBoardId(boardId);
    fetchProjectsWithTasks(boardId);

    const interval = setInterval(() => {
      fetchProjectsWithTasks(boardId);
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
