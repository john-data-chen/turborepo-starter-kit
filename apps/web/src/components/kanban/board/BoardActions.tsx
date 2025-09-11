'use client'

import React from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useDeleteBoard, useUpdateBoard } from '@/lib/api/boards/queries'
import { boardSchema } from '@/types/boardForm'
import { Board } from '@/types/dbInterface'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { BoardForm } from './BoardForm'

interface BoardActionsProps {
  board: Board
  onDelete?: () => void
  asChild?: boolean
  className?: string
  children?: React.ReactNode
}

export const BoardActions = React.forwardRef<HTMLButtonElement, BoardActionsProps>(
  ({ board, onDelete, asChild = false, children }, ref) => {
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
    const [editEnable, setEditEnable] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    // Get the delete and update mutations
    const deleteBoard = useDeleteBoard()
    const updateBoard = useUpdateBoard()

    // Get router and translations
    const router = useRouter()
    const t = useTranslations('kanban.actions')

    const onSubmit = async (values: z.infer<typeof boardSchema>) => {
      try {
        if (!board?._id) {
          throw new Error('Board ID is missing')
        }

        setIsSubmitting(true)
        await updateBoard.mutateAsync(
          { id: board._id, ...values },
          {
            onSuccess: () => {
              setEditEnable(false)
              toast.success(t('boardUpdated', { title: board.title }))
              // The query invalidation is handled by the mutation's onSuccess
              router.refresh()
            },
            onError: (error: Error) => {
              console.error('Error updating board:', error)

              if (error.message.includes('not found')) {
                // If board is not found, refresh the board list
                toast.error('Board not found. The board may have been deleted.')
                router.refresh()
              } else {
                toast.error(`Failed to update board: ${error.message}`)
              }
            }
          }
        )
      } catch (error) {
        console.error('Error updating board:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)

        if (errorMessage.includes('not found')) {
          toast.error('Board not found. The board may have been deleted.')
          router.refresh()
        } else {
          toast.error(`Failed to update board: ${errorMessage}`)
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    const handleDelete = async (e: React.MouseEvent) => {
      // Prevent any default behavior and stop propagation
      e.preventDefault()
      e.stopPropagation()

      // Close the dialog immediately
      setShowDeleteDialog(false)

      try {
        // Get current path before any async operations
        const currentPath = window.location.pathname

        // Immediately redirect to /boards if we're on a board page
        if (currentPath.includes('/board/')) {
          window.location.href = '/boards'
          // Continue with deletion in the background
          setTimeout(() => deleteBoard.mutate(board._id), 0)
          return
        }

        // For all other cases, perform the deletion first
        await deleteBoard.mutateAsync(board._id, {
          onSuccess: () => {
            toast.success(t('boardDeleted'))
            // Call the onDelete callback if provided
            onDelete?.()

            // Force a hard refresh to ensure clean state
            if (window.location.pathname.endsWith('/boards')) {
              window.location.reload()
            } else {
              window.location.href = '/boards'
            }
          },
          onError: (error: Error) => {
            console.error('Failed to delete board:', error)
            toast.error(t('boardDeleteFailed', { error: error.message }))
          }
        })
      } catch (error) {
        console.error('Error in handleDelete:', error)
        toast.error(
          t('boardDeleteFailed', {
            error: error instanceof Error ? error.message : String(error)
          })
        )
      }
    }

    return (
      <>
        <Dialog
          open={editEnable}
          onOpenChange={(open) => {
            setEditEnable(open)
          }}
        >
          <DialogContent
            className="sm:max-w-md"
            onInteractOutside={(e) => {
              e.preventDefault()
              setEditEnable(false)
            }}
            onPointerDownOutside={(e) => {
              e.preventDefault()
              setEditEnable(false)
            }}
            onKeyDown={(e) => {
              // Prevent form submission on Enter key in input fields
              if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                e.stopPropagation()
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>{t('editBoardTitle')}</DialogTitle>
              <DialogDescription>{t('editBoardDescription')}</DialogDescription>
            </DialogHeader>
            <BoardForm
              defaultValues={{
                title: board.title,
                description: board.description || ''
              }}
              onSubmit={async (values: z.infer<typeof boardSchema>) => {
                await onSubmit(values)
              }}
            >
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setEditEnable(false)
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {isSubmitting ? t('saving') : t('saveChanges')}
                </Button>
              </div>
            </BoardForm>
          </DialogContent>
        </Dialog>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            {asChild ? (
              React.Children.only(children)
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="board-option-button" ref={ref}>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <DropdownMenuItem data-testid="edit-board-button" onSelect={() => setEditEnable(true)}>
              {t('edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="delete-board-button"
              onSelect={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              {t('delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmDeleteTitle', { title: board.title })}</AlertDialogTitle>
              <AlertDialogDescription>{t('confirmDeleteDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDelete}>
                {t('delete')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }
)

BoardActions.displayName = 'BoardActions'
