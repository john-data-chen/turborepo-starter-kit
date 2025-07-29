'use client';

import { SEARCH_DEBOUNCE_DELAY_MS } from '@/constants/common';
import { useDebounce } from '@/hooks/useDebounce';
import { User } from '@/types/dbInterface';
import { TaskFormSchema } from '@/types/taskForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UseTaskFormProps {
  defaultValues?: Partial<z.infer<typeof TaskFormSchema>>;
  onSubmit: (values: z.infer<typeof TaskFormSchema>) => Promise<void>;
}

export const useTaskForm = ({ defaultValues, onSubmit }: UseTaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(
    searchQuery,
    SEARCH_DEBOUNCE_DELAY_MS
  );

  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      status: 'TODO',
      dueDate: undefined,
      assignee: undefined
    }
  });

  const searchUsers = async (search: string = '') => {
    try {
      const { searchUsers } = await import('@/lib/api/users');
      return await searchUsers(search);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!assignOpen || !debouncedSearchQuery) return;

      setIsSearching(true);
      try {
        const results = await searchUsers(debouncedSearchQuery);
        setUsers(results);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [debouncedSearchQuery, assignOpen]);

  useEffect(() => {
    if (assignOpen) {
      searchUsers().then((initialUsers) => {
        setUsers(initialUsers);
      });
    }
  }, [assignOpen]);

  const handleSubmit = async (values: z.infer<typeof TaskFormSchema>) => {
    try {
      setIsSubmitting(true);
      // Transform the data before submission
      const submitData = {
        ...values,
        assignee: values.assignee
          ? { _id: values.assignee._id, name: values.assignee.name }
          : undefined
      };
      await onSubmit(submitData);
    } catch (error) {
      toast.error(`Failed to submit task: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    users,
    searchQuery,
    setSearchQuery,
    isSearching,
    assignOpen,
    setAssignOpen,
    handleSubmit
  };
};
