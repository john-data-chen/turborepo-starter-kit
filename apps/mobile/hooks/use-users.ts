import { useQuery } from "@tanstack/react-query";

import { userApi } from "@/lib/api/user-api";

export const useUsers = (searchQuery = "") => {
  return useQuery({
    queryKey: ["users", searchQuery],
    queryFn:  async () => userApi.searchUsers(searchQuery),
    staleTime: 5 * 60 * 1000
  });
};
