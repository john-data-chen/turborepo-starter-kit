import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Project, type Task, UserInfo } from '@/types/dbInterface';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { PointerIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import NewTaskDialog from '../task/NewTaskDialog';
import { TaskCard } from '../task/TaskCard';
import { ProjectActions } from './ProjectAction';

export interface ProjectDragData {
  type: 'Project';
  project: Project;
}

interface BoardProjectProps {
  project: Project;
  tasks: Task[];
  isOverlay?: boolean;
}

export function BoardProject({
  project,
  tasks: initialTasks,
  isOverlay
}: BoardProjectProps) {
  const { filter, fetchTasksByProject } = useWorkspaceStore();
  const t = useTranslations('kanban.project');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [_isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // Helper function to get display name from user object or ID
  const getUserDisplayName = (
    user: string | UserInfo | null | undefined
  ): string => {
    if (!user) return 'Unknown';
    if (typeof user === 'string') return user;
    return user.name || user.email || user._id || 'Unknown';
  };

  console.log('project:', JSON.stringify(project));

  // Fetch tasks when the component mounts or when the project changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!project?._id) return;

      setIsLoading(true);
      setError(null);

      try {
        const fetchedTasks = await fetchTasksByProject(project._id);
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [project?._id, fetchTasksByProject]);

  const filteredTasks = useMemo(() => {
    if (!filter.status || !tasks?.length) return tasks || [];
    return tasks.filter((task) => task.status === filter.status);
  }, [tasks, filter.status]);

  // Memoize task IDs for better performance
  const tasksIds = useMemo(() => tasks?.map((task) => task._id) || [], [tasks]);

  // Setup drag & drop functionality
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: project._id,
    data: {
      type: 'Project',
      project
    } satisfies ProjectDragData,
    attributes: {
      roleDescription: `Project: ${project.title}`
    }
  });

  // Define drag & drop styles
  const style = {
    transition,
    transform: CSS.Translate.toString(transform)
  };

  // Define card style variants based on drag state
  const variants = cva(
    'h-[75vh] max-h-[75vh] w-full md:w-[380px] bg-secondary flex flex-col shrink-0 snap-center',
    {
      variants: {
        dragging: {
          default: 'border-2 border-transparent',
          over: 'ring-2 opacity-30',
          overlay: 'ring-2 ring-primary'
        }
      }
    }
  );

  const dragState = isOverlay ? 'overlay' : isDragging ? 'over' : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        variants({ dragging: dragState }),
        'overflow-hidden' // Prevent content from overflowing
      )}
      data-testid={`project-container`}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b-2 p-4 space-y-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            {...attributes}
            {...listeners}
            className="text-primary/50 h-8 w-16 cursor-grab p-0"
          >
            <span className="sr-only">drag project: {project.title}</span>
            <PointerIcon className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{project.title}</h3>
        </div>
        <ProjectActions
          id={project._id}
          title={project.title}
          description={project.description}
        />
      </CardHeader>

      <CardContent className="flex flex-col gap-4 p-0 overflow-hidden">
        <ScrollArea className="h-full px-2 pt-2">
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="text-xs">
              {t('description')}: {project.description || t('noDescription')}
            </Badge>
            <Badge variant="outline" className="text-xs truncate">
              {t('owner')}: {getUserDisplayName(project.owner)}
            </Badge>
            {Array.isArray(project.members) && project.members.length > 0 && (
              <Badge variant="outline" className="text-xs truncate">
                {t('members')}:{' '}
                {project.members
                  .map((member) => getUserDisplayName(member))
                  .filter(Boolean)
                  .join(', ')}
              </Badge>
            )}
          </div>
          <div className="px-2">
            <NewTaskDialog projectId={project._id} />
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            <SortableContext items={tasksIds}>
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </SortableContext>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
  return (
    <ScrollArea className="w-full">
      <div className="flex flex-col md:flex-row gap-4">{children}</div>
      <ScrollBar orientation="horizontal" className="hidden md:flex" />
    </ScrollArea>
  );
}
