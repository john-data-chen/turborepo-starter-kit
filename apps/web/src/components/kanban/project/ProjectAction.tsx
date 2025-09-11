'use client'

import * as React from 'react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useDeleteProject, useUpdateProject } from '@/lib/api/projects/queries'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { projectSchema } from '@/types/projectForm'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { z } from 'zod'
import { ProjectForm } from './ProjectForm'

interface ProjectActionsProps {
  id: string
  title: string
  description?: string
  ownerId: string // Add ownerId to check permissions
}

export function ProjectActions({ id, title, description, ownerId }: ProjectActionsProps) {
  // Check if current user is the project owner
  const { userId } = useWorkspaceStore()
  const isOwner = userId === ownerId
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [editEnable, setEditEnable] = React.useState(false)
  const updateProject = useWorkspaceStore((state) => state.updateProject)
  const deleteProjectMutation = useDeleteProject()
  const updateProjectMutation = useUpdateProject()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false) // State for controlling menu

  type ProjectFormData = z.infer<typeof projectSchema>

  const t = useTranslations('kanban.project')

  async function onSubmit(values: ProjectFormData) {
    if (!userId) {
      toast.error(t('userNotAuthenticated'))
      return
    }

    try {
      await updateProject(
        id,
        values.title,
        values.description ?? undefined, // Convert null to undefined
        async (id, data) => {
          const updateData = {
            id,
            title: data.title,
            description: data.description || null,
            owner: userId
          }

          return updateProjectMutation.mutateAsync(updateData)
        }
      )
      toast.success(t('updateSuccess'))
      setEditEnable(false)
    } catch (error) {
      toast.error(t('updateFailed', { error: (error as Error).message }))
    }
  }

  function removeProject(id: string, _p0: (id: any) => Promise<void>) {
    deleteProjectMutation.mutate(id)
  }

  return (
    <>
      <Dialog open={editEnable} onOpenChange={setEditEnable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editProjectTitle')}</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={onSubmit} defaultValues={{ title, description }}>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditEnable(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </ProjectForm>
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false} open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-12 p-0 bg-background hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            data-testid="project-option-button"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => setEditEnable(true)}
            data-testid="edit-project-button"
            className={!isOwner ? 'text-muted-foreground line-through cursor-not-allowed' : ''}
            disabled={!isOwner}
          >
            {t('edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className={
              !isOwner
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : 'text-red-600 hover:!text-red-600 hover:!bg-destructive/10'
            }
            data-testid="delete-project-button"
            disabled={!isOwner}
          >
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle', { title })}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDeleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false)
                removeProject(id, (id) => deleteProjectMutation.mutateAsync(id))
                toast.success(t('deleteSuccess', { title }))
              }}
            >
              {t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
