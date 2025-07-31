'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { useTranslations } from 'next-intl';
import React from 'react';

export function TaskFilter() {
  const { filter, setFilter, projects } = useWorkspaceStore();
  const t = useTranslations('kanban.task');

  const statusCounts = React.useMemo(() => {
    const counts = {
      TOTAL: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0
    };

    projects.forEach((project) => {
      project.tasks.forEach((task) => {
        counts.TOTAL++;
        if (task.status && counts.hasOwnProperty(task.status)) {
          counts[task.status as keyof typeof counts]++;
        }
      });
    });

    return counts;
  }, [projects]);

  const handleFilterChange = React.useCallback(
    (value: string) => {
      setFilter({ status: value === 'TOTAL' ? null : value });
    },
    [setFilter]
  );

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter({ search: event.target.value });
    },
    [setFilter]
  );

  return (
    <div className="flex items-center gap-2 mb-4 w-full md:w-auto">
      <Input
        type="text"
        placeholder={t('searchPlaceholder')}
        value={filter.search}
        onChange={handleSearchChange}
        className="bg-background w-full md:w-[300px]"
        data-testid="search-input"
      />
      <Select
        value={filter.status || 'TOTAL'}
        onValueChange={handleFilterChange}
      >
        <SelectTrigger className="w-[140px]" data-testid="status-select">
          <SelectValue placeholder={t('filterByStatus')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TOTAL" data-testid="total-item">
            {t('total')}
            <Badge variant="outline" className="ml-2">
              {statusCounts.TOTAL}
            </Badge>
          </SelectItem>
          <SelectItem value="TODO" data-testid="todo-item">
            {t('statusTodo')}
            <Badge variant="outline" className="ml-2">
              {statusCounts.TODO}
            </Badge>
          </SelectItem>
          <SelectItem value="IN_PROGRESS" data-testid="in-progress-item">
            {t('statusInProgress')}
            <Badge variant="outline" className="ml-2">
              {statusCounts.IN_PROGRESS}
            </Badge>
          </SelectItem>
          <SelectItem value="DONE" data-testid="done-item">
            {t('statusDone')}
            <Badge variant="outline" className="ml-2">
              {statusCounts.DONE}
            </Badge>
          </SelectItem>
        </SelectContent>
      </Select>

      {(filter.status || filter.search) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilter({ status: null, search: '' });
          }}
          data-testid="clear-filter-button"
        >
          {t('clearFilter')}
        </Button>
      )}
    </div>
  );
}
