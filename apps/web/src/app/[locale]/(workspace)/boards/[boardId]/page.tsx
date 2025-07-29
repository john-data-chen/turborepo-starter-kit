'use client';

import { Board } from '@/components/kanban/board/Board';
import PageContainer from '@/components/layout/PageContainer';
import { useTaskStore } from '@/lib/stores/workspace-store';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { memo, Suspense, useEffect } from 'react';

const MemoizedBoard = memo(Board);

export default function BoardPage() {
  const params = useParams();
  const t = useTranslations('kanban');
  const boardId = params?.boardId as string;
  const setCurrentBoardId = useTaskStore((state) => state.setCurrentBoardId);
  const fetchProjects = useTaskStore((state) => state.fetchProjects);

  useEffect(() => {
    if (!boardId) return;
    setCurrentBoardId(boardId);
    fetchProjects(boardId);
  }, [boardId, setCurrentBoardId, fetchProjects]);

  return (
    <PageContainer>
      <main className="space-y-4">
        <Suspense fallback={<div>{t('loadingBoard')}</div>}>
          <MemoizedBoard />
        </Suspense>
      </main>
    </PageContainer>
  );
}
