import { useQuery } from '@tanstack/react-query';
import { getUserById, searchUsers } from '../users';

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  search: (query: string) => [...USER_KEYS.lists(), { search: query }] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const
};

export const useUser = (id?: string) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id || ''),
    queryFn: () => getUserById(id || ''),
    enabled: !!id
  });
};

export const useUserSearch = (query: string) => {
  return useQuery({
    queryKey: USER_KEYS.search(query),
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
