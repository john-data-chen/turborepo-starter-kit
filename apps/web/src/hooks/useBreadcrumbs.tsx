'use client';

import { ROUTES } from '@/constants/routes';
import { useBoard } from '@/lib/api/boards/queries';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
  isRoot?: boolean;
};

export function useBreadcrumbs() {
  const params = useParams();
  const t = useTranslations('sidebar');
  const boardId = params.boardId as string;

  // Use the useBoard hook to fetch the current board
  const {
    data: board,
    isLoading: _isLoading,
    error: _error
  } = useBoard(boardId);

  // Update the workspace store with the current board ID
  const { setCurrentBoardId } = useWorkspaceStore();

  // Update the current board ID in the workspace store when it changes
  useMemo(() => {
    if (board?._id) {
      setCurrentBoardId(board._id);
    }
  }, [board?._id, setCurrentBoardId]);

  const items: BreadcrumbItem[] = [
    {
      title: t('overview'),
      link: ROUTES.BOARDS.OVERVIEW_PAGE,
      isRoot: true
    }
  ];

  if (board) {
    items.push({
      title: board.title,
      link: ROUTES.BOARDS.OVERVIEW_PAGE + '/' + board._id
    });
  }

  return {
    items,
    rootLink: ROUTES.BOARDS.OVERVIEW_PAGE
  };
}
