'use client'

import { useCallback, useEffect, useState } from 'react'
import { useBoards } from '@/hooks/useBoards'
import { usePathname, useRouter } from '@/i18n/navigation'
import { AuthService } from '@/lib/auth/authService'
import { useAuthStore } from '@/stores/auth-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { DotsHorizontalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { BoardActions } from './board/BoardActions'
import NewBoardDialog from './board/NewBoardDialog'

type FilterType = 'all' | 'my' | 'team'

export function BoardOverview() {
  const { myBoards, teamBoards, loading: boardsLoading, refresh } = useBoards()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [isProcessingLogin, setIsProcessingLogin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('kanban')
  const tLogin = useTranslations('login')
  const { setUserInfo } = useWorkspaceStore()
  const { setSession } = useAuthStore()
  const [recentlyDeleted, setRecentlyDeleted] = useState<Set<string>>(new Set())

  // Handle board click with proper event handling
  const handleBoardClick = useCallback(
    (boardId: string, e?: React.MouseEvent) => {
      // Always prevent default to avoid any default link behavior
      e?.preventDefault()
      e?.stopPropagation()

      // If this is a click on the actions menu or a recently deleted board, don't navigate
      const isActionsClick = (e?.target as HTMLElement)?.closest('.board-actions')

      if (recentlyDeleted.has(boardId) || isActionsClick) {
        return
      }

      // Only navigate if we have a valid board ID and it's not recently deleted
      if (boardId && !recentlyDeleted.has(boardId)) {
        router.push(`/boards/${boardId}`)
      }
    },
    [recentlyDeleted, router]
  )

  // Handle board deletion
  const handleBoardDelete = useCallback(
    (boardId: string) => {
      // Store the current path
      const currentPath = window.location.pathname

      // Add to recently deleted set
      setRecentlyDeleted((prev) => new Set(prev).add(boardId))

      // Immediately redirect to /boards if we're on a board page
      if (currentPath.includes(`/board/`)) {
        window.location.href = '/boards'
        return
      }

      // Refresh the board list
      refresh()

      // Force a hard refresh to ensure we're on the correct page
      if (!currentPath.endsWith('/boards')) {
        window.location.href = '/boards'
      } else {
        window.location.reload()
      }
    },
    [refresh]
  )

  // Handle login success and user data initialization
  useEffect(() => {
    const loginSuccess = searchParams.get('login_success')

    const processLogin = async () => {
      if (loginSuccess !== 'true') return

      try {
        setIsProcessingLogin(true)

        // Always fetch fresh session to ensure we have the latest data
        const session = await AuthService.getSession()

        if (session?.user?._id) {
          // Update both auth and workspace stores with the user info
          setSession(session)
          setUserInfo(session.user.email, session.user._id)

          // Manually trigger boards data refresh after user info is set
          console.log('[BoardOverview] Triggering boards refresh after login')
          await refresh()

          // Show success message
          toast.success(tLogin('success'))

          // Clean up URL
          const params = new URLSearchParams(searchParams.toString())
          params.delete('login_success')
          const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
          await router.replace(newUrl, { scroll: false })
        } else {
          throw new Error('Failed to get user session')
        }
      } catch (error) {
        console.error('Error processing login:', error)
        toast.error(tLogin('error'))
      } finally {
        setIsProcessingLogin(false)
      }
    }

    processLogin()
  }, [searchParams, router, pathname, tLogin, setSession, setUserInfo, refresh])

  // Ensure boards data is fetched when user is authenticated
  useEffect(() => {
    const { userId } = useWorkspaceStore.getState()
    console.log('[BoardOverview] Checking if boards need to be fetched, userId:', userId)

    // If user is authenticated but we don't have boards data, fetch it
    if (userId && !boardsLoading && !myBoards?.length && !teamBoards?.length) {
      console.log('[BoardOverview] User authenticated but no boards data, triggering refresh')
      refresh()
    }
  }, [refresh, myBoards, teamBoards, boardsLoading])

  // Handle data refresh on tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refresh])

  // Show loading state while processing login or loading boards
  if (isProcessingLogin || boardsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>{t('loading')}</p>
        </div>
      </div>
    )
  }

  const filteredMyBoards = myBoards?.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()))

  const filteredTeamBoards = teamBoards?.filter((board) => board.title.toLowerCase().includes(search.toLowerCase()))

  const shouldShowMyBoards = filter === 'all' || filter === 'my'
  const shouldShowTeamBoards = filter === 'all' || filter === 'team'

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 bg-background sticky top-0 z-10">
        <div className="w-full sm:w-[200px]">
          <NewBoardDialog>
            <Button
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              data-testid="new-board-trigger"
            >
              {t('newBoard')}
            </Button>
          </NewBoardDialog>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-[200px]">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('searchBoards')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-[140px]" data-testid="select-filter-trigger">
              {' '}
              {/* Add data-testid here */}
              <SelectValue placeholder={t('filterBoards')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" data-testid="selectAllBoards">
                {t('allBoards')}
              </SelectItem>
              <SelectItem value="my" data-testid="selectMyBoards">
                {t('myBoards')}
              </SelectItem>
              <SelectItem value="team" data-testid="selectTeamBoards">
                {t('teamBoards')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {shouldShowMyBoards && (
            <section>
              <div className="flex items-center gap-2 mb-2 px-4">
                <h2 className="text-2xl font-bold" data-testid="myBoardsTitle">
                  {t('myBoards')}
                </h2>
              </div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <span className="text-sm text-muted-foreground">{t('myBoardsDescription')}</span>
              </div>
              {filteredMyBoards?.length === 0 ? (
                <p className="text-muted-foreground px-4">{t('noBoardsFound')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredMyBoards?.map((board) => (
                    <Card
                      key={board._id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleBoardClick(board._id)}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{board.title}</CardTitle>
                        <BoardActions
                          board={board}
                          asChild
                          className="board-actions"
                          onDelete={() => handleBoardDelete(board._id)}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mr-2"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                              }
                            }}
                            aria-label={board.title ? `${board.title} actions` : 'Board actions'}
                          >
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </BoardActions>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{board.description || t('noDescription')}</p>
                        <p className="text-sm mt-2">
                          {t('projects')}:{' '}
                          {board.projects.length > 0 ? board.projects.map((p) => p.title).join(' / ') : '0'}
                        </p>
                        <p className="text-sm mt-2">
                          {t('members')}: {board.members.map((m) => m.name).join(', ')}
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
              <div className="flex items-center gap-2 mb-2 px-4">
                <h2 className="text-2xl font-bold" data-testid="teamBoardsTitle">
                  {t('teamBoards')}
                </h2>
              </div>
              <div className="flex items-center gap-2 mb-2 px-4">
                <span className="text-sm text-muted-foreground">{t('teamBoardsDescription')}</span>
              </div>
              {filteredTeamBoards?.length === 0 ? (
                <p className="text-muted-foreground px-4">{t('noTeamBoardsFound')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredTeamBoards?.map((board) => (
                    <Card
                      key={board._id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleBoardClick(board._id)}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>{board.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{board.description || t('noDescription')}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            {t('owner')}:{' '}
                            {typeof board.owner === 'string' ? board.owner : board.owner?.name || 'Unknown'}
                          </p>
                          <p className="text-sm">
                            {t('projects')}:{' '}
                            {board.projects.length > 0 ? board.projects.map((p) => p.title).join(' / ') : '0'}
                          </p>
                          <p className="text-sm">
                            {t('members')}: {board.members.map((m) => m.name).join(', ')}
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
  )
}
