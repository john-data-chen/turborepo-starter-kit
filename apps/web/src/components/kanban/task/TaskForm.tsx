'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useTaskForm } from '@/hooks/useTaskForm';
import { cn } from '@/lib/utils';
import { TaskFormSchema } from '@/types/taskForm';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { z } from 'zod';

interface TaskFormProps {
  defaultValues?: z.infer<typeof TaskFormSchema>;
  onSubmit: (values: z.infer<typeof TaskFormSchema>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function TaskForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = 'Submit'
}: TaskFormProps) {
  const {
    form,
    isSubmitting,
    users,
    searchQuery,
    setSearchQuery,
    isSearching,
    assignOpen,
    setAssignOpen,
    handleSubmit
  } = useTaskForm({ defaultValues, onSubmit });
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const t = useTranslations('kanban.task');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('titleLabel')}</FormLabel>
              <FormControl>
                <Input
                  id="title"
                  placeholder={t('titlePlaceholder')}
                  className="col-span-4"
                  data-testid="task-title-input"
                  aria-label="Task title"
                  {...field}
                />
              </FormControl>
              <FormMessage data-testid="task-title-error-message" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('dueDateLabel')}</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    aria-label="Select due date"
                    className={cn(
                      'w-auto pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                    type="button"
                  >
                    {field.value ? (
                      format(field.value, 'yyyy-MM-dd')
                    ) : (
                      <span data-testid="task-date-picker-trigger">
                        {t('pickDate')}
                      </span>
                    )}
                    <CalendarIcon
                      className="ml-auto h-4 w-4 opacity-50"
                      aria-hidden="true"
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setCalendarOpen(false);
                    }}
                    fromDate={new Date()}
                    initialFocus
                    data-testid="task-date-picker-calendar"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assignee"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('assignToLabel')}</FormLabel>
              <FormControl>
                <Popover open={assignOpen} onOpenChange={setAssignOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={assignOpen}
                      aria-controls="assignee-options"
                      className="w-full justify-between"
                    >
                      {field.value
                        ? field.value.name || field.value._id
                        : t('selectUser')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    id="assignee-options"
                    role="listbox"
                    className="p-0 z-[60]"
                    side="bottom"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={t('searchUsers')}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {isSearching ? t('searching') : t('noUsersFound')}
                        </CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user._id}
                              value={user.name!}
                              onSelect={() => {
                                field.onChange(user);
                                setAssignOpen(false);
                              }}
                              className="flex flex-col items-start"
                            >
                              <span>{user.name || user.email}</span>
                              {user.name && (
                                <span className="text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('statusLabel')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 mt-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="TODO" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('statusTodo')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="IN_PROGRESS" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('statusInProgress')}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="DONE" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('statusDone')}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{t('descriptionLabel')}</FormLabel>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                className="col-span-4"
                data-testid="task-description-input"
                aria-label="Task description"
                {...field}
              />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              data-testid="cancel-task-button"
            >
              {t('cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            data-testid="submit-task-button"
          >
            {isSubmitting ? t('submitting') : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
