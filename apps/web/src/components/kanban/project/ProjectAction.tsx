'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { projectApi } from '@/lib/api/projectApi';
import { useDeleteProject, useUpdateProject } from '@/lib/api/projects/queries';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { projectSchema } from '@/types/projectForm';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { ProjectForm } from './ProjectForm';

interface ProjectActionsProps {
  id: string;
  title: string;
  description?: string;
}

export function ProjectActions({
  id,
  title,
  description
}: ProjectActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [editEnable, setEditEnable] = React.useState(false);
  const updateProject = useWorkspaceStore((state) => state.updateProject);
  const removeProject = useWorkspaceStore((state) => state.removeProject);
  const currentBoardId = useWorkspaceStore((state) => state.currentBoardId);
  const fetchProjects = useWorkspaceStore((state) => state.fetchProjects);
  const t = useTranslations('kanban.project');

  // State for permissions
  const [permissions, setPermissions] = React.useState<{
    canEditProject: boolean;
    canDeleteProject: boolean;
  } | null>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = React.useState(false);
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false); // State for controlling menu

  type ProjectFormData = z.infer<typeof projectSchema>;

  async function fetchProjectPermissions() {
    if (!id) {
      console.error('No project ID provided');
      setIsLoadingPermissions(false);
      setPermissions({ canEditProject: false, canDeleteProject: false });
      return;
    }

    // Ensure the ID is a string and trim any whitespace
    const projectId = String(id).trim();

    // Basic validation for MongoDB ObjectId format
    const isValidId = /^[0-9a-fA-F]{24}$/.test(projectId);

    if (!isValidId) {
      console.error('Invalid project ID format:', projectId);
      setPermissions({ canEditProject: false, canDeleteProject: false });
      setIsLoadingPermissions(false);
      return;
    }

    setIsLoadingPermissions(true);

    try {
      const permissions = await projectApi.getProjectPermissions(projectId);
      setPermissions(permissions);
    } catch (error) {
      console.error('Error fetching project permissions:', error);
      // Set default permissions to most restrictive without showing error message
      setPermissions({ canEditProject: false, canDeleteProject: false });
    } finally {
      setIsLoadingPermissions(false);
    }
  }

  const { userId } = useWorkspaceStore();

  async function onSubmit(values: ProjectFormData) {
    if (!userId) {
      toast.error(t('userNotAuthenticated'));
      return;
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
          };

          return updateProjectMutation.mutateAsync(updateData);
        }
      );
      await fetchProjects(currentBoardId!);
      toast.success(t('updateSuccess'));
      setEditEnable(false);
    } catch (error) {
      toast.error(t('updateFailed', { error: (error as Error).message }));
    }
  }

  return (
    <>
      <Dialog open={editEnable} onOpenChange={setEditEnable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editProjectTitle')}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={onSubmit}
            defaultValues={{ title, description }}
          >
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditEnable(false)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit">{t('save')}</Button>
            </div>
          </ProjectForm>
        </DialogContent>
      </Dialog>

      <DropdownMenu
        modal={false}
        open={isMenuOpen}
        onOpenChange={(open) => {
          setIsMenuOpen(open);
          if (open && !permissions) {
            // Fetch permissions only when menu is opened and permissions are not yet fetched
            fetchProjectPermissions();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-12 p-0 bg-background hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
            data-testid="project-option-button"
          >
            {isLoadingPermissions ? (
              <DotsHorizontalIcon className="h-4 w-4 animate-pulse" />
            ) : (
              <DotsHorizontalIcon className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              if (permissions?.canEditProject && !isLoadingPermissions) {
                setEditEnable(true);
              }
            }}
            disabled={isLoadingPermissions || !permissions?.canEditProject}
            className={
              !permissions?.canEditProject || isLoadingPermissions
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : ''
            }
            data-testid="edit-project-button"
          >
            {t('edit')}
            {isLoadingPermissions && ' (loading...)'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              if (permissions?.canDeleteProject && !isLoadingPermissions) {
                setShowDeleteDialog(true);
              }
            }}
            disabled={isLoadingPermissions || !permissions?.canDeleteProject}
            className={
              !permissions?.canDeleteProject || isLoadingPermissions
                ? 'text-muted-foreground line-through cursor-not-allowed'
                : 'text-red-600 hover:!text-red-600 hover:!bg-destructive/10'
            }
            data-testid="delete-project-button"
          >
            {t('delete')}
            {isLoadingPermissions && ' (loading...)'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('confirmDeleteTitle', { title })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(false);
                removeProject(id, (id) =>
                  deleteProjectMutation.mutateAsync(id)
                );
                toast.success(t('deleteSuccess', { title }));
              }}
            >
              {t('delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
