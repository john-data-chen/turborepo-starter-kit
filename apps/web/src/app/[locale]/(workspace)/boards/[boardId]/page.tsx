'use client'

import { memo, Suspense, useEffect } from 'react'
import { Board } from '@/components/kanban/board/Board'
import PageContainer from '@/components/layout/PageContainer'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

const MemoizedBoard = memo(Board)

export default function BoardPage() {
  const params = useParams()
  const t = useTranslations('kanban')
  const boardId = params?.boardId as string
  const setCurrentBoardId = useWorkspaceStore((state) => state.setCurrentBoardId)
  const fetchProjects = useWorkspaceStore((state) => state.fetchProjects)

  useEffect(() => {
    if (!boardId) {return}
    setCurrentBoardId(boardId)
    fetchProjects(boardId)
  }, [boardId, setCurrentBoardId, fetchProjects])

  return (
    <PageContainer>
      <main className="space-y-4">
        <Suspense fallback={<div>{t('loadingBoard')}</div>}>
          <MemoizedBoard />
        </Suspense>
      </main>
    </PageContainer>
  )
}
