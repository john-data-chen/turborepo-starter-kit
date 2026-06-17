"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constants/common";
import { useDebounce } from "@/hooks/useDebounce";
import { userApi } from "@/lib/api/userApi";
import { TaskStatus, User } from "@/types/dbInterface";
import { TaskFormSchema } from "@/types/taskForm";

interface UseTaskFormProps {
  // `assignee` may arrive as a bare user id (string) which the hook resolves to a full
  // user object — see processedDefaultValues below.
  defaultValues?: Partial<Omit<z.infer<typeof TaskFormSchema>, "assignee">> & {
    assignee?: z.infer<typeof TaskFormSchema>["assignee"] | string;
  };
  onSubmit: (values: z.infer<typeof TaskFormSchema>) => Promise<void>;
}

export const useTaskForm = ({ defaultValues, onSubmit }: UseTaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY_MS);

  // Process default values to ensure assignee is in the schema's object format.
  const processedDefaultValues = useMemo(():
    | Partial<z.infer<typeof TaskFormSchema>>
    | undefined => {
    if (!defaultValues) {
      return undefined;
    }

    const { assignee, ...rest } = defaultValues;
    if (!assignee) {
      return rest;
    }

    // If assignee is just an ID, normalize to an object; full user data is fetched
    // later by the useEffect below.
    if (typeof assignee === "string") {
      return { ...rest, assignee: { _id: assignee, name: null } };
    }

    // assignee is already an object (may miss name/email — filled in by the effect).
    return { ...rest, assignee };
  }, [defaultValues]);

  const form = useForm<z.infer<typeof TaskFormSchema>>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: TaskStatus.TODO,
      dueDate: undefined,
      assignee: undefined,
      ...processedDefaultValues
    }
  });

  const searchUsersLocal = async (search = ""): Promise<User[]> => {
    try {
      return await userApi.searchUsers(search);
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (!assignOpen || !debouncedSearchQuery) {
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchUsersLocal(debouncedSearchQuery);
        setUsers(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchUsers();
  }, [assignOpen, debouncedSearchQuery]);

  // Load initial users when the component mounts
  useEffect(() => {
    const loadInitialUsers = async () => {
      const initialUsers = await searchUsersLocal();
      setUsers(initialUsers);
    };
    loadInitialUsers();
  }, []);

  // Load assignee data when defaultValues changes
  useEffect(() => {
    const loadAssigneeData = async () => {
      // If we already have assignee data in the expected format, use it directly
      if (
        defaultValues?.assignee &&
        typeof defaultValues.assignee === "object" &&
        "_id" in defaultValues.assignee
      ) {
        return;
      }

      // If assignee is a string (ID) or we have an ID in the assignee object
      const assigneeId = defaultValues?.assignee
        ? typeof defaultValues.assignee === "string"
          ? defaultValues.assignee
          : defaultValues.assignee._id
        : null;

      if (!assigneeId) {
        form.setValue("assignee", undefined);
        return;
      }

      // Try to find the user in the existing users list
      const existingUser = users.find((u) => u._id === assigneeId);
      if (existingUser) {
        form.setValue("assignee", {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email
        });
        return;
      }

      // If not found, fetch the user in the background
      const fetchUser = async () => {
        try {
          const userData = await userApi.getUserById(assigneeId);
          if (userData) {
            setUsers((prev) => [...prev, userData]);
            form.setValue("assignee", {
              _id: userData._id,
              name: userData.name,
              email: userData.email
            });
          }
        } catch (error) {
          console.error("Error fetching assignee data:", error);
        }
      };

      fetchUser();
    };

    loadAssigneeData();
  }, [defaultValues?.assignee, form, users]);

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
