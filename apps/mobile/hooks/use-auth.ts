import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { authService } from "@/lib/auth/auth-service";
import { useAuthStore } from "@/stores/auth";

const AUTH_KEYS = {
  session: ["auth", "session"] as const
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { setSession, setUser, clear } = useAuthStore();

  const sessionQuery = useQuery({
    queryKey: AUTH_KEYS.session,
    queryFn: async () => authService.getSession(),
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: async (email: string) => authService.login(email),
    onSuccess: async (data) => {
      const user = data.user ?? (await authService.getProfile());
      setSession({ user, accessToken: data.access_token });
      setUser(user);
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session });
      router.replace("/(tabs)");
    }
  });

  const logout = async () => {
    await authService.logout();
    clear();
    queryClient.clear();
    router.replace("/(auth)/login");
  };

  return {
    isAuthenticated: !!sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    user: sessionQuery.data?.user ?? null,
    session: sessionQuery.data ?? null,
    error: loginMutation.error?.message ?? sessionQuery.error?.message ?? null,
    login: loginMutation.mutate,
    loginMutation,
    logout
  };
}
