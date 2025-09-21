'use client'

import React from 'react'
import { useCreateProject } from '@/lib/api/projects/queries'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { projectSchema } from '@/types/projectForm'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@repo/ui/components/dialog'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ProjectForm } from './ProjectForm'

export interface NewProjectDialogProps {
  onProjectAdd?: (title: string, description?: string) => void
}

type ProjectFormData = z.infer<typeof projectSchema>

export default function NewProjectDialog({ onProjectAdd }: NewProjectDialogProps) {
  const addProject = useWorkspaceStore((state) => state.addProject)
  const [isOpen, setIsOpen] = React.useState(false)
  const t = useTranslations('kanban.project')

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  })

  const createProjectMutation = useCreateProject()

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const projectId = await addProject(data.title, data.description || '', (projectData) =>
        createProjectMutation.mutateAsync(projectData)
      )

      if (!projectId) {
        toast.error(t('createFailed'))
        return
      }

      onProjectAdd?.(data.title, data.description)
      toast.success(t('createSuccess'))
      setIsOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error(t('createFailed'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="default" className="w-full md:w-[200px]" data-testid="new-project-trigger">
          {t('addNewProject')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="new-project-dialog">
        <DialogHeader>
          <DialogTitle>{t('addNewProjectTitle')}</DialogTitle>
          <DialogDescription>{t('addNewProjectDescription')}</DialogDescription>
        </DialogHeader>
        <ProjectForm onSubmit={handleSubmit} data-testid="new-project-form">
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" data-testid="submit-project-button">
              {t('addProject')}
            </Button>
          </DialogFooter>
        </ProjectForm>
      </DialogContent>
    </Dialog>
  )
}
