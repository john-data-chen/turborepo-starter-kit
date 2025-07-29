import { ROUTES } from '@/constants/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User;
  accessToken: string;
}

export const AUTH_KEYS = {
  all: ['auth'] as const,
  session: () => [...AUTH_KEYS.all, 'session'] as const,
  profile: () => [...AUTH_KEYS.all, 'profile'] as const
};

const API_BASE = ROUTES.API;

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers
    },
    credentials: 'include'
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Request failed');
    if (typeof window !== 'undefined' && response.status === 401) {
      Cookies.remove('jwt');
    }
    throw new Error(error || 'Request failed');
  }

  return response.json();
}

export function useSession() {
  return useQuery<Session | null>({
    queryKey: AUTH_KEYS.session(),
    queryFn: async () => {
      const token = Cookies.get('jwt');
      if (!token) return null;

      try {
        const user = await fetchWithAuth<User>(`${API_BASE}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { user, accessToken: token };
      } catch (error) {
        console.error('Session validation error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (email: string) => {
      const data = await fetchWithAuth<{ access_token: string }>(
        ROUTES.AUTH.LOGIN,
        {
          method: 'POST',
          body: JSON.stringify({ email })
        }
      );

      if (typeof window !== 'undefined') {
        Cookies.set('jwt', data.access_token, { expires: 7, path: '/' });
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.session() });
      router.push('/dashboard');
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        await fetchWithAuth(`${API_BASE}/auth/logout`, {
          method: 'POST'
        });
      } finally {
        // Always clear the token even if the request fails
        if (typeof window !== 'undefined') {
          Cookies.remove('jwt', { path: '/' });
        }
      }
    },
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    }
  });
}

export function useProfile() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: async () => {
      if (!session?.accessToken) throw new Error('Not authenticated');
      return fetchWithAuth<User>(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${session.accessToken}` }
      });
    },
    enabled: !!session?.accessToken
  });
}
