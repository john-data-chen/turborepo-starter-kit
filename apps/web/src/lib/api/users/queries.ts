import { useQuery } from "@tanstack/react-query"

import { USER_KEYS } from "@/types/userApi"

import { userApi } from "../userApi"

export const useUser = (id?: string) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id || ""),
    queryFn:  async () => userApi.getUserById(id || ""),
    enabled: !!id
  })
}

export const useUserSearch = (query: string) => {
  return useQuery({
    queryKey: USER_KEYS.list({ search: query }),
    queryFn:  async () => userApi.searchUsers(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
