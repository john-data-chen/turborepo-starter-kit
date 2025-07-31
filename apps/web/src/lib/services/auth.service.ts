import { ROUTES } from '@/constants/routes';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User;
  accessToken: string;
}

const API_BASE = ROUTES.API;

export class AuthService {
  private static async fetchWithAuth<T>(
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

  static async login(email: string): Promise<{ access_token: string }> {
    return this.fetchWithAuth<{ access_token: string }>(ROUTES.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  static async getProfile(token: string): Promise<User> {
    return this.fetchWithAuth<User>(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async getSession(): Promise<Session | null> {
    const token = Cookies.get('jwt');
    if (!token) return null;

    try {
      const user = await this.getProfile(token);
      return { user, accessToken: token };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      Cookies.remove('jwt', { path: '/' });
    }
  }
}
